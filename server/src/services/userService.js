import { getPool } from '../config/database.js';

export const listOrgUsers = async (organizationId) => {
    const pool = getPool();
    const [rows] = await pool.query(
        `SELECT id, name, email, role
     FROM users
     WHERE organizationId = ? AND deletedAt IS NULL
     ORDER BY name ASC`,
        [organizationId],
    );
    return rows;
};
