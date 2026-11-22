/**
 * Instagram link helpers (pure). Instagram scraping is not allowed — the app
 * stores the link, embeds it via Instagram's official iframe, and the admin
 * uploads the image for the clean projection graphic.
 */

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
]);

const SHORTCODE_PATTERN = /\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/;

export function extractInstagramShortcode(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = SHORTCODE_PATTERN.exec(url.pathname);
  return match ? match[1] : null;
}
