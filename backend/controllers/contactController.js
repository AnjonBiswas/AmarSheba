import { pool } from '../config/db.js';

function formatContact(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    created_at: row.created_at,
  };
}

export async function createContactMessage(req, res) {
  const {
    name = '',
    email = '',
    phone = '',
    topic = '',
    message = '',
  } = req.body;

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone.trim();
  const trimmedTopic = topic.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || !normalizedEmail || !trimmedMessage) {
    return res.status(400).json({ message: 'name, email, and message are required.' });
  }

  const finalMessage = trimmedTopic
    ? `Topic: ${trimmedTopic}\n\n${trimmedMessage}`
    : trimmedMessage;

  const [result] = await pool.query(
    `
      INSERT INTO contacts (name, email, phone, message)
      VALUES (?, ?, ?, ?)
    `,
    [trimmedName, normalizedEmail, trimmedPhone || null, finalMessage],
  );

  const [rows] = await pool.query(
    `
      SELECT id, name, email, phone, message, created_at
      FROM contacts
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  );

  return res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully.',
    contact: formatContact(rows[0]),
  });
}

export async function getContactMessages(_req, res) {
  const [rows] = await pool.query(
    `
      SELECT id, name, email, phone, message, created_at
      FROM contacts
      ORDER BY created_at DESC, id DESC
    `,
  );

  return res.json({
    contacts: rows.map(formatContact),
  });
}
