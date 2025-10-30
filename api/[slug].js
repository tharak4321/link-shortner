import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
    const { pathname } = new URL(request.url);
    const slug = pathname.substring(1); // Remove the leading '/'

    // If there's no slug, redirect to the homepage.
    const homeUrl = new URL('/', request.url);

    if (!slug) {
        return Response.redirect(homeUrl, 307); // 307 is a temporary redirect
    }

    try {
        // Look for the slug in the Vercel KV store
        const longUrl = await kv.get(`link:${slug}`);

        if (longUrl) {
            // If found, perform a permanent redirect (308)
            return Response.redirect(longUrl, 308);
        } else {
            // If not found, redirect to the homepage
            return Response.redirect(homeUrl, 307);
        }
    } catch (error) {
        console.error('Error fetching from KV:', error);
        // In case of an error, redirect to homepage as a fallback
        return Response.redirect(homeUrl, 307);
    }
}
