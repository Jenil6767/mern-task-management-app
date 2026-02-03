import { getPool } from '../config/database.js';

/**
 * Insert activity log inside an existing transaction.
 * @param {object} connection - mysql2 connection within a transaction
 * @param {object} params
 * @param {number} params.taskId
 * @param {number} params.userId
 * @param {string} params.action - CREATED | UPDATED | STATUS_CHANGED | DELETED
 * @param {object} params.changes - JSON serializable object
 */
export const logActivity = async (connection, { taskId, userId, action, changes }) => {
  await connection.query(
    `INSERT INTO activity_logs (taskId, userId, action, changes)
     VALUES (?, ?, ?, ?)`,
    [taskId, userId, action, changes ? JSON.stringify(changes) : null],
  );
};

export const getActivityLogs = async ({ taskId, userId, projectId, organizationId }) => {
  const pool = getPool();

  let where = '1=1';
  const params = [];

  if (taskId) {
    where += ' AND al.taskId = ?';
    params.push(taskId);
  }

  if (userId) {
    where += ' AND al.userId = ?';
    params.push(userId);
  }

  if (projectId) {
    // enforce org via join
    where += ' AND t.projectId = ?';
    params.push(projectId);
  }

  // tenant isolation: join through tasks -> projects
  where += ' AND p.organizationId = ?';
  params.push(organizationId);

  const [rows] = await pool.query(
    `SELECT al.id, al.taskId, al.userId, al.action, al.changes, al.timestamp
     FROM activity_logs al
     JOIN tasks t ON al.taskId = t.id
     JOIN projects p ON t.projectId = p.id
     WHERE ${where}
     ORDER BY al.timestamp DESC`,
    params,
  );

  return rows;
};


