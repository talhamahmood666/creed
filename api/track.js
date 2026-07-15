/**
 * Tracking pixel API for Creed AI
 * Serves 1x1 transparent GIF for open/click tracking.
 * Events logged to Vercel system logs.
 * Brevo's built-in tracking handles persistence.
 */

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

module.exports = async (req, res) => {
  const event = req.query.event || 'open';
  const email = req.query.email || 'unknown';

  // Log to Vercel system logs
  console.log(`[TRACK] event=${event} email=${email} ts=${new Date().toISOString()}`);

  // Return 1x1 transparent GIF
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', PIXEL.length);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).send(PIXEL);
};
