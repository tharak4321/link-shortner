import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
    const { pathname } = new URL(request.url);
    const slug = pathname.substring(1); // Remove the leading '/'

    if (!slug) {
        // If there's no slug, redirect to the homepage.
        // Replace with your actual domain or a specific URL if you prefer.
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl, { status: 307 });
    }

    try {
        // Look for the slug in the Vercel KV store
        const longUrl = await kv.get(`link:${slug}`);

        if (longUrl) {
            // If found, perform a permanent redirect (308)
            return NextResponse.redirect(new URL(longUrl), { status: 308 });
        } else {
            // If not found, redirect to the homepage
            const homeUrl = new URL('/', request.url);
            return NextResponse.redirect(homeUrl, { status: 307 });
        }
    } catch (error) {
        console.error('Error fetching from KV:', error);
        // In case of an error, redirect to homepage as a fallback
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl, { status: 307 });
    }
}
