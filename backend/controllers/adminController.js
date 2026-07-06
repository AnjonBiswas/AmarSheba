import { pool } from '../config/db.js';

export async function getAdminOverview(_req, res) {
  const [[usersRow]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
  const [[servicesRow]] = await pool.query('SELECT COUNT(*) AS total_services FROM services');
  const [[applicationsRow]] = await pool.query('SELECT COUNT(*) AS total_applications FROM applications');
  const [[pendingRow]] = await pool.query("SELECT COUNT(*) AS pending_applications FROM applications WHERE status = 'pending'");
  const [[contactsRow]] = await pool.query('SELECT COUNT(*) AS total_contacts FROM contacts');

  return res.json({
    overview: {
      totalUsers: Number(usersRow?.total_users || 0),
      totalServices: Number(servicesRow?.total_services || 0),
      totalApplications: Number(applicationsRow?.total_applications || 0),
      pendingApplications: Number(pendingRow?.pending_applications || 0),
      contactMessages: Number(contactsRow?.total_contacts || 0),
    },
  });
}
