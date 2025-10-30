import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug'); // Get slug from the query parameter

    // Define the homepage URL to redirect to if anything goes wrong
    const homeUrl = new URL('/', request.url);

    if (!slug) {
        // If there's no slug (e.g., someone just visits the site root), go to the homepage
        // Vercel is smart enough to serve your public/index.html file here.
        return new Response('Redirecting to homepage...', {
            status: 307,
            headers: { Location: homeUrl.toString() },
        });
    }

    try {
        // Look for the slug in the Vercel KV store
        const longUrl = await kv.get(`link:${slug}`);

        if (longUrl) {
            // If found, perform a permanent redirect (308)
            return Response.redirect(longUrl, 308);
        } else {
            // If the slug is not found in the database, redirect to the homepage
            return Response.redirect(homeUrl, 307);
        }
    } catch (error) {
        console.error('Error fetching from KV:', error);
        // In case of a database error, also redirect to the homepage as a fallback
        return Response.redirect(homeUrl, 307);
    }
}
