import { kv } from '@vercel/kv';

// This configures the function to run on Vercel's Edge runtime, making it consistent
export const config = {
  runtime: 'edge',
};

// Function to generate a random 6-character string
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

export default async function handler(request) {
  // Check if the method is POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Read the body from the request (the Edge-compatible way)
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate the URL format
    try {
      new URL(url);
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const shortCode = generateShortCode();
    
    // Store the mapping in Vercel KV
    await kv.set(`link:${shortCode}`, url);

    // Construct the response URL dynamically from the request headers
    const host = request.headers.get('host');
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const shortUrl = `${protocol}://${host}/${shortCode}`;

    // Return a successful response (the Edge-compatible way)
    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // This will catch any other errors, like if the request body isn't valid JSON
    console.error(error);
    return new Response(JSON.stringify({ error: 'A server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
