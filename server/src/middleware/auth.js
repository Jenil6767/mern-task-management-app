import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';
import { env } from '../config/env.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, email, role, organizationId
       FROM users
       WHERE id = ? AND deletedAt IS NULL`,
      [payload.sub],
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      organizationId: rows[0].organizationId,
    };

    return next();
  } catch (err) {
    return next(err);
  }
};


