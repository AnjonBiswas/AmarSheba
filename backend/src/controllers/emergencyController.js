import { pool } from '../db.js';

const fields = ['name', 'category', 'phone', 'description', 'district', 'address', 'latitude', 'longitude', 'is_active'];

export async function listEmergencyServices(req, res) {
  const { search = '', category = '', active = 'true' } = req.query;
  const params = [];
  const where = [];

  if (active === 'true') {
    where.push('is_active = 1');
  }

  if (category) {
    where.push('category = ?');
    params.push(category);
  }

  if (search) {
    where.push('(name LIKE ? OR category LIKE ? OR phone LIKE ? OR description LIKE ? OR district LIKE ? OR address LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term, term, term);
  }

  const sql = `SELECT * FROM emergency_services ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY category, name`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

export async function getEmergencyService(req, res) {
  const [rows] = await pool.query('SELECT * FROM emergency_services WHERE id = ?', [req.params.id]);

  if (!rows.length) {
    return res.status(404).json({ message: 'Emergency service not found' });
  }

  return res.json(rows[0]);
}

export async function createEmergencyService(req, res) {
  const payload = pickPayload(req.body);
  const [result] = await pool.query(
    `INSERT INTO emergency_services (${fields.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    fields.map((field) => payload[field]),
  );
  const [rows] = await pool.query('SELECT * FROM emergency_services WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}

export async function updateEmergencyService(req, res) {
  const payload = pickPayload(req.body);
  const [result] = await pool.query(
    `UPDATE emergency_services SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map((field) => payload[field]), req.params.id],
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Emergency service not found' });
  }

  const [rows] = await pool.query('SELECT * FROM emergency_services WHERE id = ?', [req.params.id]);
  return res.json(rows[0]);
}

export async function deleteEmergencyService(req, res) {
  const [result] = await pool.query('DELETE FROM emergency_services WHERE id = ?', [req.params.id]);

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Emergency service not found' });
  }

  return res.status(204).send();
}

function pickPayload(body) {
  return {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    phone: String(body.phone || '').trim(),
    description: String(body.description || '').trim(),
    district: String(body.district || 'National').trim(),
    address: String(body.address || '').trim(),
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    is_active: body.is_active === undefined ? 1 : Number(Boolean(body.is_active)),
  };
}
