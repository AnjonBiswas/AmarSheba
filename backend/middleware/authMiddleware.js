import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function authenticate(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'amarsheba_dev_secret');
    const [rows] = await pool.query(
      `
        SELECT id, name, email, phone, role, is_verified, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [payload.id],
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'User account was not found.' });
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone,
      role: rows[0].role,
      is_verified: Boolean(rows[0].is_verified),
      created_at: rows[0].created_at,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required.' });
}
