export default function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Basic validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // ✅ For now this just logs and confirms
  // (To actually store emails, you'd connect a free service like EmailOctopus or Mailchimp)
  console.log('New subscriber:', email);

  return res.status(200).json({
    success: true,
    message: 'Thank you for subscribing! 🌿'
  });
}
