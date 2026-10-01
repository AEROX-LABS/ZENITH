/**
 * Resolves the dynamic base URL for Supabase redirects and auth callbacks.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_SITE_URL (custom production domain)
 * 2. process.env.NEXT_PUBLIC_VERCEL_URL (Vercel preview/production deployment URL)
 * 3. window.location.origin (client-side fallback if available)
 * 4. Fallback to http://localhost:3000 for local development
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined);

  // If environment variables are not set and we are in the browser, check window.location.origin
  if (!url && typeof window !== 'undefined' && window.location.origin) {
    url = window.location.origin;
  }

  // Fallback to localhost if nothing else is defined
  url = url || 'http://localhost:3000';

  // Ensure url includes http/https protocol
  url = url.includes('http') ? url : `https://${url}`;

  // Ensure trailing slash is removed so paths like `${getURL()}/auth/callback` format cleanly
  url = url.replace(/\/+$/, '');

  return url;
}

export default getURL;
