import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../config/mailer.js';
import { pool } from '../config/db.js';

const OTP_TABLE = 'email_verification_otps';

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET || 'amarsheba_dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_verified: Boolean(user.is_verified),
    created_at: user.created_at,
  };
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function getOtpExpiryMinutes() {
  return Number(process.env.OTP_EXPIRES_MINUTES || 10);
}

async function ensureOtpTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${OTP_TABLE} (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      email VARCHAR(190) NOT NULL,
      otp_hash VARCHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_${OTP_TABLE}_user_id (user_id),
      KEY idx_${OTP_TABLE}_email (email),
      CONSTRAINT fk_${OTP_TABLE}_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function issueOtp(user) {
  await ensureOtpTable();

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + getOtpExpiryMinutes() * 60 * 1000);

  await pool.query(`DELETE FROM ${OTP_TABLE} WHERE user_id = ?`, [user.id]);
  await pool.query(
    `
      INSERT INTO ${OTP_TABLE} (user_id, email, otp_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    [user.id, user.email, hashOtp(otp), expiresAt],
  );

  const delivery = await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp,
    expiresInMinutes: getOtpExpiryMinutes(),
  });

  return delivery;
}

export async function register(req, res) {
  const { name = '', email = '', phone = '', password = '' } = req.body;
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  if (!trimmedName || !normalizedEmail || !normalizedPhone || password.length < 6) {
    return res.status(400).json({ message: 'Name, email, phone, and password with at least 6 characters are required.' });
  }

  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
    [normalizedEmail, normalizedPhone],
  );

  if (existingUsers.length) {
    return res.status(409).json({ message: 'User already exists with this email or phone.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const role = normalizedEmail === 'admin@amarsheba.com' ? 'admin' : 'user';

  const [result] = await pool.query(
    `
      INSERT INTO users (name, email, phone, password, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [trimmedName, normalizedEmail, normalizedPhone, hashedPassword, role, 0],
  );

  const [rows] = await pool.query(
    `
      SELECT id, name, email, phone, role, is_verified, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  );
  const user = rows[0];
  const otpDelivery = await issueOtp(user);

  return res.status(201).json({
    user: publicUser(user),
    token: createToken(user),
    verificationRequired: true,
    otpSent: Boolean(otpDelivery?.delivered || otpDelivery?.fallback),
    message: otpDelivery?.delivered
      ? 'Registration successful. Please verify the OTP sent to your email.'
      : 'Registration successful. SMTP is not configured, so the OTP was logged on the server.',
  });
}

export async function login(req, res) {
  const { emailOrPhone = '', password = '' } = req.body;
  const identifier = emailOrPhone.trim();

  if (!identifier || !password) {
    return res.status(400).json({ message: 'emailOrPhone and password are required.' });
  }

  const normalizedEmail = identifier.toLowerCase();
  const [rows] = await pool.query(
    `
      SELECT id, name, email, phone, password, role, is_verified, created_at
      FROM users
      WHERE email = ? OR phone = ?
      LIMIT 1
    `,
    [normalizedEmail, identifier],
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email/phone or password.' });
  }

  return res.json({
    user: publicUser(user),
    token: createToken(user),
  });
}

export async function getProfile(req, res) {
  const [rows] = await pool.query(
    `
      SELECT id, name, email, phone, role, is_verified, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [req.user.id],
  );
  const user = rows[0];

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: publicUser(user) });
}

export async function verifyOtp(req, res) {
  const { email = '', otp = '' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  if (!normalizedEmail || !normalizedOtp) {
    return res.status(400).json({ message: 'email and otp are required.' });
  }

  await ensureOtpTable();

  const [users] = await pool.query(
    `
      SELECT id, name, email, phone, role, is_verified, created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail],
  );
  const user = users[0];

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const [otpRows] = await pool.query(
    `
      SELECT id, otp_hash, expires_at, used_at
      FROM ${OTP_TABLE}
      WHERE user_id = ? AND email = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [user.id, normalizedEmail],
  );
  const otpEntry = otpRows[0];

  if (!otpEntry) {
    return res.status(404).json({ message: 'No OTP request was found for this email.' });
  }

  if (otpEntry.used_at) {
    return res.status(400).json({ message: 'This OTP has already been used.' });
  }

  if (new Date(otpEntry.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
  }

  if (hashOtp(normalizedOtp) !== otpEntry.otp_hash) {
    return res.status(400).json({ message: 'Invalid OTP code.' });
  }

  await pool.query(`UPDATE ${OTP_TABLE} SET used_at = NOW() WHERE id = ?`, [otpEntry.id]);
  await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [user.id]);

  const verifiedUser = {
    ...user,
    is_verified: 1,
  };

  return res.json({
    success: true,
    message: 'Email verified successfully.',
    user: publicUser(verifiedUser),
    token: createToken(verifiedUser),
  });
}

export async function resendOtp(req, res) {
  const { email = '' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'email is required.' });
  }

  const [users] = await pool.query(
    `
      SELECT id, name, email, phone, role, is_verified, created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail],
  );
  const user = users[0];

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.is_verified) {
    return res.status(400).json({ message: 'This email is already verified.' });
  }

  const otpDelivery = await issueOtp(user);

  return res.json({
    success: true,
    otpSent: Boolean(otpDelivery?.delivered || otpDelivery?.fallback),
    message: otpDelivery?.delivered
      ? 'A new OTP has been sent to your email.'
      : 'SMTP is not configured, so the new OTP was logged on the server.',
  });
}
