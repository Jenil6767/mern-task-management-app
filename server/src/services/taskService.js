import { getPool } from '../config/database.js';
import { ApiError, buildPagination } from '../utils/helpers.js';
import { TASK_STATUS } from '../utils/constants.js';
import { logActivity } from './activityService.js';

const baseTaskSelect = `
  SELECT t.id, t.title, t.description, t.status, t.priority,
         t.dueDate, t.assignedTo, u.name AS assigneeName, t.projectId, t.organizationId,
         t.version, t.createdAt, t.updatedAt, t.completedAt
  FROM tasks t
  JOIN projects p ON t.projectId = p.id
  LEFT JOIN users u ON t.assignedTo = u.id
`;

const ensureTaskForOrg = async (taskId, organizationId) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `${baseTaskSelect}
     WHERE t.id = ? AND t.deletedAt IS NULL
       AND p.organizationId = ?
       AND p.deletedAt IS NULL`,
    [taskId, organizationId],
  );
  if (!rows.length) {
    throw new ApiError(404, 'Task not found');
  }
  return rows[0];
};

export const createTask = async (user, payload) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ensure project in org and active
    const [projRows] = await connection.query(
      `SELECT id FROM projects
       WHERE id = ? AND organizationId = ? AND deletedAt IS NULL`,
      [payload.projectId, user.organizationId],
    );
    if (!projRows.length) {
      throw new ApiError(400, 'Invalid project for organization');
    }

    const [result] = await connection.query(
      `INSERT INTO tasks
       (title, description, status, priority, dueDate, assignedTo, projectId, organizationId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.title,
        payload.description || null,
        payload.status || TASK_STATUS.TODO,
        payload.priority || 'MEDIUM',
        payload.dueDate || null,
        payload.assignedTo || null,
        payload.projectId,
        user.organizationId,
      ],
    );

    const taskId = result.insertId;

    await logActivity(connection, {
      taskId,
      userId: user.id,
      action: 'CREATED',
      changes: payload,
    });

    await connection.commit();

    return ensureTaskForOrg(taskId, user.organizationId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const listTasks = async (organizationId, projectId, query) => {
  const { page, limit, offset } = buildPagination(query);
  const pool = getPool();

  const whereParts = [
    't.deletedAt IS NULL',
    'p.deletedAt IS NULL',
    'p.organizationId = ?',
    't.projectId = ?',
  ];
  const params = [organizationId, projectId];

  if (query.status) {
    whereParts.push('t.status = ?');
    params.push(query.status);
  }

  if (query.assignedTo) {
    whereParts.push('t.assignedTo = ?');
    params.push(query.assignedTo);
  }

  if (query.priority) {
    whereParts.push('t.priority = ?');
    params.push(query.priority);
  }

  if (query.search) {
    whereParts.push('t.title LIKE ?');
    params.push(`%${query.search}%`);
  }

  const where = whereParts.join(' AND ');

  const sortBy = ['createdAt', 'dueDate'].includes(query.sortBy) ? query.sortBy : 'createdAt';
  const order = query.order === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `${baseTaskSelect}
     WHERE ${where}
     ORDER BY t.${sortBy} ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total
     FROM tasks t
     JOIN projects p ON t.projectId = p.id
     WHERE ${where}`,
    params,
  );

  return {
    tasks: rows,
    total: countRows[0].total,
    page,
    limit,
  };
};

export const getTaskById = async (taskId, organizationId) => {
  return ensureTaskForOrg(taskId, organizationId);
};

export const updateTask = async (user, taskId, payload) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const current = await ensureTaskForOrg(taskId, user.organizationId);

    const fields = ['t.version = t.version + 1'];
    const params = [];

    ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'].forEach((key) => {
      if (payload[key] !== undefined) {
        fields.push(`t.${key} = ?`);
        params.push(payload[key]);
      }
    });

    params.push(taskId, payload.version, user.organizationId);

    const [result] = await connection.query(
      `UPDATE tasks t
       JOIN projects p ON t.projectId = p.id
       SET ${fields.join(', ')}
       WHERE t.id = ? 
         AND t.version = ?
         AND p.organizationId = ? 
         AND t.deletedAt IS NULL 
         AND p.deletedAt IS NULL`,
      params,
    );

    if (result.affectedRows === 0) {
      throw new ApiError(409, 'Task was updated by another user. Please refresh and retry.');
    }

    const updated = await ensureTaskForOrg(taskId, user.organizationId);

    const changes = {};
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== current[key]) {
        changes[key] = { from: current[key], to: payload[key] };
      }
    });

    if (Object.keys(changes).length) {
      await logActivity(connection, {
        taskId,
        userId: user.id,
        action: 'UPDATED',
        changes,
      });
    }

    await connection.commit();

    return updated;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const updateTaskStatusOptimistic = async (user, taskId, status, version) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const current = await ensureTaskForOrg(taskId, user.organizationId);

    if (current.status === status) {
      return current;
    }

    const [result] = await connection.query(
      `UPDATE tasks t
       JOIN projects p ON t.projectId = p.id
       SET t.status = ?, t.version = t.version + 1,
           t.completedAt = CASE WHEN ? = 'DONE' THEN NOW() ELSE t.completedAt END
       WHERE t.id = ?
         AND t.version = ?
         AND p.organizationId = ?
         AND t.deletedAt IS NULL
         AND p.deletedAt IS NULL`,
      [status, status, taskId, version, user.organizationId],
    );

    if (result.affectedRows === 0) {
      throw new ApiError(409, 'Task was updated by another user. Please refresh and retry.');
    }

    await logActivity(connection, {
      taskId,
      userId: user.id,
      action: 'STATUS_CHANGED',
      changes: {
        status: { from: current.status, to: status },
        version: { from: current.version, to: current.version + 1 },
      },
    });

    await connection.commit();

    return ensureTaskForOrg(taskId, user.organizationId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const softDeleteTask = async (user, taskId) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const current = await ensureTaskForOrg(taskId, user.organizationId);

    await connection.query(
      `UPDATE tasks t
       JOIN projects p ON t.projectId = p.id
       SET t.deletedAt = NOW()
       WHERE t.id = ?
         AND p.organizationId = ?
         AND t.deletedAt IS NULL
         AND p.deletedAt IS NULL`,
      [taskId, user.organizationId],
    );

    await logActivity(connection, {
      taskId,
      userId: user.id,
      action: 'DELETED',
      changes: { title: current.title },
    });

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};


