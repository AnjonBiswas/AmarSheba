export function healthCheck(_req, res) {
  res.json({
    success: true,
    message: 'AmarSheba backend running',
  });
}
