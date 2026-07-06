export function requireAdmin(req, res, next) {
  const role = req.header('x-user-role');

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}
