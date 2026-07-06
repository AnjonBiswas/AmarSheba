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

function splitDocuments(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatService(row) {
  return {
    id: row.id,
    slug: slugify(row.category || row.title_en),
    category: row.category,
    title_en: row.title_en,
    title_bn: row.title_bn,
    description_en: row.description_en,
    description_bn: row.description_bn,
    required_documents: row.required_documents,
    required_documents_list: splitDocuments(row.required_documents),
    fee: row.fee,
    processing_time: row.processing_time,
    created_at: row.created_at,
  };
}

function validatePayload(body) {
  const payload = {
    title_en: body.title_en?.trim() || '',
    title_bn: body.title_bn?.trim() || '',
    category: body.category?.trim() || '',
    description_en: body.description_en?.trim() || '',
    description_bn: body.description_bn?.trim() || '',
    required_documents: Array.isArray(body.required_documents)
      ? body.required_documents.map((item) => item.trim()).filter(Boolean).join(', ')
      : body.required_documents?.trim() || '',
    fee: body.fee?.trim() || '',
    processing_time: body.processing_time?.trim() || '',
  };

  if (!payload.title_en || !payload.title_bn || !payload.category || !payload.description_en || !payload.description_bn) {
    return {
      ok: false,
      message: 'title_en, title_bn, category, description_en, and description_bn are required.',
    };
  }

  return { ok: true, payload };
}

async function findServiceRow(identifier) {
  if (/^\d+$/.test(String(identifier))) {
    const [rows] = await pool.query(
      `
        SELECT id, title_en, title_bn, category, description_en, description_bn, required_documents, fee, processing_time, created_at
        FROM services
        WHERE id = ?
        LIMIT 1
      `,
      [Number(identifier)],
    );

    return rows[0] || null;
  }

  const [rows] = await pool.query(
    `
      SELECT id, title_en, title_bn, category, description_en, description_bn, required_documents, fee, processing_time, created_at
      FROM services
      ORDER BY id ASC
    `,
  );

  const normalizedIdentifier = slugify(identifier);
  return rows.find((row) => slugify(row.category || row.title_en) === normalizedIdentifier) || null;
}

export async function getServices(_req, res) {
  const [rows] = await pool.query(
    `
      SELECT id, title_en, title_bn, category, description_en, description_bn, required_documents, fee, processing_time, created_at
      FROM services
      ORDER BY id ASC
    `,
  );

  return res.json({
    services: rows.map(formatService),
  });
}

export async function getServiceById(req, res) {
  const row = await findServiceRow(req.params.id);

  if (!row) {
    return res.status(404).json({ message: 'Service not found.' });
  }

  return res.json({ service: formatService(row) });
}

export async function createService(req, res) {
  const validation = validatePayload(req.body);

  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const { payload } = validation;
  const [result] = await pool.query(
    `
      INSERT INTO services (
        title_en, title_bn, category, description_en, description_bn, required_documents, fee, processing_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.title_en,
      payload.title_bn,
      payload.category,
      payload.description_en,
      payload.description_bn,
      payload.required_documents || null,
      payload.fee || null,
      payload.processing_time || null,
    ],
  );

  const created = await findServiceRow(result.insertId);
  return res.status(201).json({ service: formatService(created) });
}

export async function updateService(req, res) {
  const existing = await findServiceRow(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: 'Service not found.' });
  }

  const validation = validatePayload(req.body);

  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  const { payload } = validation;
  await pool.query(
    `
      UPDATE services
      SET
        title_en = ?,
        title_bn = ?,
        category = ?,
        description_en = ?,
        description_bn = ?,
        required_documents = ?,
        fee = ?,
        processing_time = ?
      WHERE id = ?
    `,
    [
      payload.title_en,
      payload.title_bn,
      payload.category,
      payload.description_en,
      payload.description_bn,
      payload.required_documents || null,
      payload.fee || null,
      payload.processing_time || null,
      existing.id,
    ],
  );

  const updated = await findServiceRow(existing.id);
  return res.json({ service: formatService(updated) });
}

export async function deleteService(req, res) {
  const existing = await findServiceRow(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: 'Service not found.' });
  }

  await pool.query('DELETE FROM services WHERE id = ?', [existing.id]);
  return res.json({ success: true, message: 'Service deleted successfully.' });
}
