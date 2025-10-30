import { kv } from '@vercel/kv';

// Function to generate a random 6-character string
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = request.body;

    if (!url) {
        return response.status(400).json({ error: 'URL is required' });
    }

    try {
        // Ensure it's a valid URL format
        new URL(url);
    } catch (error) {
        return response.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = generateShortCode();
    
    // Store the mapping in Vercel KV. The key is `link:<code>` and value is the long URL
    await kv.set(`link:${shortCode}`, url);

    // Vercel automatically provides the domain, or you can use your custom domain
    const domain = process.env.VERCEL_URL || 'localhost:3000';
    const shortUrl = `https://${domain}/${shortCode}`;

    return response.status(200).json({ shortUrl });
}
