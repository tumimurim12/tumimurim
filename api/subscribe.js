const crypto = require('crypto');

// In-memory storage for demo (use a database in production)
const subscribers = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = (req.body.email || '').toString().trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Check for duplicates
  if (subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.status(200).json({ message: 'Already subscribed' });
  }

  // Create subscription record
  const token = crypto.randomBytes(20).toString('hex');
  const record = {
    email,
    subscribedAt: new Date().toISOString(),
    confirmed: false,
    token
  };
  subscribers.push(record);

  const confirmUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}/api/confirm?token=${token}`;

  console.log('[Newsletter] New subscription:', email);
  console.log('[Confirm URL]:', confirmUrl);

  return res.status(200).json({
    message: 'Thanks! Your email has been submitted.',
    confirmUrl
  });
}
