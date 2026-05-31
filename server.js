const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'subscribers.json');
const CONFIRM_LOG = path.join(__dirname, 'confirmation_links.json');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function readSubscribers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw || '[]');
    }
  } catch (err) {
    console.error('Failed to read subscribers file', err);
  }
  return [];
}

function writeSubscribers(list) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write subscribers file', err);
    return false;
  }
}

// Simple health-check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/subscribe', (req, res) => {
  const email = (req.body.email || '').toString().trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const subscribers = readSubscribers();

  // Avoid exact duplicates
  if (subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.status(200).json({ message: 'Already subscribed' });
  }

  // Create confirmation token
  const token = crypto.randomBytes(20).toString('hex');
  const record = { email, subscribedAt: new Date().toISOString(), confirmed: false, token };
  subscribers.push(record);

  if (!writeSubscribers(subscribers)) {
    return res.status(500).json({ error: 'Could not save subscription' });
  }

  const confirmUrl = `${req.protocol}://${req.get('host')}/api/confirm?token=${token}`;

  // Log the confirmation link (for development). In production send via email provider.
  try {
    const entry = { email, confirmUrl, createdAt: new Date().toISOString() };
    fs.appendFileSync(CONFIRM_LOG, JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to log confirmation link', err);
  }

  console.log('Confirmation URL (dev):', confirmUrl);

  return res.status(200).json({ message: 'Subscribed — confirmation required', confirmUrl });
});

// Confirm endpoint
app.get('/api/confirm', (req, res) => {
  const token = (req.query.token || '').toString();
  if (!token) return res.status(400).send('Missing token');

  const subscribers = readSubscribers();
  const idx = subscribers.findIndex(s => s.token === token);
  if (idx === -1) return res.status(404).send('Invalid or expired token');

  subscribers[idx].confirmed = true;
  delete subscribers[idx].token;
  writeSubscribers(subscribers);

  return res.send('Email confirmed — thank you!');
});

// Dev: list subscribers (no tokens returned)
app.get('/api/subscribers', (req, res) => {
  const subscribers = readSubscribers().map(s => ({ email: s.email, subscribedAt: s.subscribedAt, confirmed: s.confirmed || false }));
  res.json(subscribers);
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Newsletter backend listening on http://localhost:${PORT}`);
});
