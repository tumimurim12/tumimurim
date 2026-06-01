import crypto from 'node:crypto';

const subscribers = new Map();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept'
};

function json(payload, status = 200, headers = {}) {
  return Response.json(payload, {
    status,
    headers: {
      ...corsHeaders,
      ...headers
    }
  });
}

async function readEmail(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    return (body.email || '').toString().trim();
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await request.formData();
    return (form.get('email') || '').toString().trim();
  }

  const text = await request.text();

  try {
    const body = JSON.parse(text);
    return (body.email || '').toString().trim();
  } catch {
    return (new URLSearchParams(text).get('email') || '').trim();
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(request) {
  const email = await readEmail(request);

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  const key = email.toLowerCase();

  if (subscribers.has(key)) {
    return json({ message: 'Already subscribed.' });
  }

  const record = {
    id: crypto.randomUUID(),
    email,
    subscribedAt: new Date().toISOString()
  };

  subscribers.set(key, record);
  console.log('[Newsletter] New subscription:', record);

  return json({
    message: 'Thanks! Your email has been submitted.'
  });
}

export function GET() {
  return json({ error: 'Method not allowed' }, 405, {
    Allow: 'POST, OPTIONS'
  });
}

async function fetch(request) {
  if (request.method === 'OPTIONS') {
    return OPTIONS();
  }

  if (request.method === 'POST') {
    return POST(request);
  }

  return GET();
}

export default {
  fetch
};
