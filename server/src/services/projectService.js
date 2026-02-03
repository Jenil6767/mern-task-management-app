import { getPool } from '../config/database.js';
import { ApiError } from '../utils/helpers.js';

export const createProject = async ({ name, description, organizationId }) => {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO projects (name, description, organizationId)
     VALUES (?, ?, ?)`,
    [name, description || null, organizationId],
  );

  const [rows] = await pool.query(
    `SELECT id, name, description, organizationId, createdAt, updatedAt
     FROM projects
     WHERE id = ? AND deletedAt IS NULL`,
    [result.insertId],
  );

  return rows[0];
};

export const listProjects = async (organizationId) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.organizationId, p.createdAt, p.updatedAt,
            (SELECT COUNT(*) FROM tasks t WHERE t.projectId = p.id AND t.deletedAt IS NULL) as taskCount,
            (SELECT COUNT(*) FROM tasks t 
             WHERE t.projectId = p.id 
               AND t.deletedAt IS NULL 
               AND t.status != 'DONE' 
               AND t.dueDate IS NOT NULL 
               AND t.dueDate < NOW()) as overdueCount
     FROM projects p
     WHERE p.organizationId = ? AND p.deletedAt IS NULL
     ORDER BY p.createdAt DESC`,
    [organizationId],
  );
  return rows;
};

export const getProjectByIdForOrg = async (projectId, organizationId) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, description, organizationId, createdAt, updatedAt
     FROM projects
     WHERE id = ? AND organizationId = ? AND deletedAt IS NULL`,
    [projectId, organizationId],
  );
  if (!rows.length) {
    throw new ApiError(404, 'Project not found');
  }
  return rows[0];
};

export const updateProject = async (projectId, organizationId, payload) => {
  const pool = getPool();

  const fields = [];
  const params = [];

  ['name', 'description'].forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  });

  if (!fields.length) {
    return getProjectByIdForOrg(projectId, organizationId);
  }

  params.push(projectId, organizationId);

  const [result] = await pool.query(
    `UPDATE projects
     SET ${fields.join(', ')}
     WHERE id = ? AND organizationId = ? AND deletedAt IS NULL`,
    params,
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, 'Project not found');
  }

  return getProjectByIdForOrg(projectId, organizationId);
};

export const softDeleteProject = async (projectId, organizationId) => {
  const pool = getPool();
  const [result] = await pool.query(
    `UPDATE projects
     SET deletedAt = NOW()
     WHERE id = ? AND organizationId = ? AND deletedAt IS NULL`,
    [projectId, organizationId],
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, 'Project not found');
  }
};

export const assignUsersToProject = async (projectId, organizationId, userIds) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ensure project belongs to org
    const [projRows] = await connection.query(
      `SELECT id FROM projects
       WHERE id = ? AND organizationId = ? AND deletedAt IS NULL`,
      [projectId, organizationId],
    );
    if (!projRows.length) {
      throw new ApiError(404, 'Project not found');
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      await connection.commit();
      connection.release();
      return;
    }

    // ensure users belong to same org
    const [userRows] = await connection.query(
      `SELECT id FROM users
       WHERE id IN (?) AND organizationId = ? AND deletedAt IS NULL`,
      [userIds, organizationId],
    );

    const validIds = userRows.map((u) => u.id);
    if (!validIds.length) {
      throw new ApiError(400, 'No valid users for this organization');
    }

    // clear existing assignments then insert (simple strategy)
    await connection.query('DELETE FROM project_users WHERE projectId = ?', [projectId]);

    const values = validIds.map((uid) => [projectId, uid]);
    await connection.query(
      'INSERT INTO project_users (projectId, userId) VALUES ?',
      [values],
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};


