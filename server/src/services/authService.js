import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getPool } from '../config/database.js';
import { env } from '../config/env.js';
import { ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/helpers.js';

const SALT_ROUNDS = 10;

const generateInviteCode = () => crypto.randomBytes(8).toString('hex');

/**
 * Register a new user.
 * If inviteCode is provided, user joins an existing organization.
 * Otherwise a new organization is created.
 */
export const register = async ({ name, email, password, inviteCode, organizationName, role }) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      throw new ApiError(409, 'Email already in use');
    }

    let organizationId;
    const requestedRole = (role && role.toUpperCase() === 'ADMIN' ? ROLES.ADMIN : ROLES.MEMBER);
    let finalRole = requestedRole;

    if (inviteCode) {
      const [orgRows] = await connection.query(
        'SELECT id FROM organizations WHERE inviteCode = ?',
        [inviteCode],
      );
      if (!orgRows.length) {
        throw new ApiError(400, 'Invalid invite code');
      }
      organizationId = orgRows[0].id;
      finalRole = ROLES.MEMBER;
    } else {
      // Try to find existing organization by name if member
      const [existingOrg] = await connection.query(
        'SELECT id FROM organizations WHERE name = ?',
        [organizationName],
      );

      if (existingOrg.length) {
        organizationId = existingOrg[0].id;
        // If joining existing org, they are a member by default unless specifically asked to be admin
        // For this practical, let's respect the requestedRole
        finalRole = requestedRole;
      } else {
        // Create new organization
        const newInvite = generateInviteCode();
        const [orgResult] = await connection.query(
          'INSERT INTO organizations (name, inviteCode) VALUES (?, ?)',
          [organizationName, newInvite],
        );
        organizationId = orgResult.insertId;
        // If creating new org, they MUST be admin
        finalRole = ROLES.ADMIN;
      }
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const [userResult] = await connection.query(
      `INSERT INTO users (name, email, password, role, organizationId)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashed, finalRole, organizationId],
    );

    const userId = userResult.insertId;

    await connection.commit();

    const user = { id: userId, name, email, role, organizationId };
    const token = jwt.sign({ sub: userId, org: organizationId, role }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    return { user, token };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Authenticate user with email and password.
 */
export const login = async ({ email, password }) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, password, role, organizationId
     FROM users
     WHERE email = ? AND deletedAt IS NULL`,
    [email],
  );

  if (!rows.length) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const userRow = rows[0];
  const match = await bcrypt.compare(password, userRow.password);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    organizationId: userRow.organizationId,
  };

  const token = jwt.sign(
    { sub: user.id, org: user.organizationId, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );

  return { user, token };
};

export const getMe = async (userId) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, role, organizationId
     FROM users
     WHERE id = ? AND deletedAt IS NULL`,
    [userId],
  );
  if (!rows.length) {
    throw new ApiError(404, 'User not found');
  }
  return rows[0];
};



