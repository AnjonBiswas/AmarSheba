import { pool } from '../config/db.js';

function slugify(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatApplication(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name,
    user_email: row.user_email,
    service_id: row.service_id,
    service_title_en: row.service_title_en,
    service_title_bn: row.service_title_bn,
    service_slug: slugify(row.service_category || row.service_title_en),
    status: row.status,
    note: row.note,
    created_at: row.created_at,
  };
}

export async function getApplications(_req, res) {
  const [rows] = await pool.query(
    `
      SELECT
        applications.id,
        applications.user_id,
        applications.service_id,
        applications.status,
        applications.note,
        applications.created_at,
        users.name AS user_name,
        users.email AS user_email,
        services.title_en AS service_title_en,
        services.title_bn AS service_title_bn,
        services.category AS service_category
      FROM applications
      INNER JOIN users ON users.id = applications.user_id
      INNER JOIN services ON services.id = applications.service_id
      ORDER BY applications.created_at DESC, applications.id DESC
    `,
  );

  return res.json({
    applications: rows.map(formatApplication),
  });
}

export async function updateApplication(req, res) {
  const { id } = req.params;
  const { status = '', note = '' } = req.body;
  const normalizedStatus = status.trim().toLowerCase();
  const normalizedNote = note.trim();
  const allowedStatuses = ['pending', 'processing', 'approved', 'rejected'];

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({ message: 'A valid application status is required.' });
  }

  const [result] = await pool.query(
    `
      UPDATE applications
      SET status = ?, note = ?
      WHERE id = ?
    `,
    [normalizedStatus, normalizedNote || null, id],
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Application not found.' });
  }

  const [rows] = await pool.query(
    `
      SELECT
        applications.id,
        applications.user_id,
        applications.service_id,
        applications.status,
        applications.note,
        applications.created_at,
        users.name AS user_name,
        users.email AS user_email,
        services.title_en AS service_title_en,
        services.title_bn AS service_title_bn,
        services.category AS service_category
      FROM applications
      INNER JOIN users ON users.id = applications.user_id
      INNER JOIN services ON services.id = applications.service_id
      WHERE applications.id = ?
      LIMIT 1
    `,
    [id],
  );

  return res.json({
    application: formatApplication(rows[0]),
  });
}
