/**
 * Tracking pixel API for Creed AI
 * Serves 1x1 transparent GIF and logs open/click events.
 * Forwards events to n8n webhook for persistence.
 */

const https = require('https');
const http = require('http');

const N8N_WEBHOOK = 'http://localhost:5678/webhook/track';

// 1x1 transparent GIF pixel
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function forwardToN8n(event, email, prospect, url, userAgent) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      event: event,
      email: email,
      prospectName: prospect || '',
      url: url || '',
      userAgent: userAgent || '',
      timestamp: new Date().toISOString()
    });

    const parts = N8N_WEBHOOK.replace('http://', '').split('/');
    const host = parts[0];
    const path = '/' + parts.slice(1).join('/');

    const req = http.request({
      hostname: host.split(':')[0],
      port: parseInt(host.split(':')[1] || '80'),
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      resolve();
    });

    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  const event = req.query.event || 'open';
  const email = req.query.email || 'unknown';
  const prospect = req.query.name || '';
  const url = req.query.url || '';
  const userAgent = req.headers['user-agent'] || '';

  // Log to Vercel
  console.log(`[TRACK] event=${event} email=${email} prospect=${prospect}`);

  // Forward to n8n webhook asynchronously (don't block the response)
  forwardToN8n(event, email, prospect, url, userAgent);

  // Return 1x1 transparent GIF
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', PIXEL.length);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).send(PIXEL);
};
