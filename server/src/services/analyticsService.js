import { getPool } from '../config/database.js';

export const getAnalytics = async ({ organizationId, projectId }) => {
  const pool = getPool();

  const params = [organizationId];
  let projectFilter = '';
  if (projectId) {
    projectFilter = 'AND t.projectId = ?';
    params.push(projectId);
  }

  // User-level stats
  const [userStats] = await pool.query(
    `
    SELECT
      u.id AS userId,
      u.name AS userName,
      COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) AS completedTasks,
      COUNT(CASE WHEN t.status != 'DONE' OR t.status IS NULL THEN 1 END) AS pendingTasks,
      COUNT(
        CASE
          WHEN t.status != 'DONE'
           AND t.dueDate IS NOT NULL
           AND t.dueDate < NOW()
          THEN 1 END
      ) AS overdueTasks,
      AVG(
        CASE
          WHEN t.completedAt IS NOT NULL
          THEN TIMESTAMPDIFF(HOUR, t.createdAt, t.completedAt)
          ELSE NULL
        END
      ) AS avgCompletionTimeHours
    FROM users u
    LEFT JOIN tasks t
      ON t.assignedTo = u.id
     AND t.deletedAt IS NULL
    JOIN projects p
      ON (t.projectId = p.id OR t.projectId IS NULL)
    WHERE u.organizationId = ?
      AND (p.organizationId = u.organizationId OR t.projectId IS NULL)
      ${projectFilter}
      AND u.deletedAt IS NULL
    GROUP BY u.id, u.name
    `,
    params,
  );

  // Project-level stats
  const [projectStatsRows] = await pool.query(
    `
    SELECT
      COUNT(*) AS totalTasks,
      COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) AS completedTasks,
      COUNT(CASE WHEN t.status != 'DONE' OR t.status IS NULL THEN 1 END) AS pendingTasks,
      COUNT(
        CASE
          WHEN t.status != 'DONE'
           AND t.dueDate IS NOT NULL
           AND t.dueDate < NOW()
          THEN 1 END
      ) AS overdueTasks,
      AVG(
        CASE
          WHEN t.completedAt IS NOT NULL
           AND t.createdAt IS NOT NULL
          THEN TIMESTAMPDIFF(HOUR, t.createdAt, t.completedAt)
          ELSE NULL
        END
      ) AS avgCompletionTimeHours
    FROM tasks t
    JOIN projects p ON t.projectId = p.id
    WHERE p.organizationId = ?
      ${projectFilter}
      AND t.deletedAt IS NULL
      AND p.deletedAt IS NULL
    `,
    params,
  );

  const projectStats = projectStatsRows[0] || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    avgCompletionTimeHours: null,
  };

  return {
    userStats,
    projectStats,
  };
};


