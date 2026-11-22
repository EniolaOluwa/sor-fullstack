/**
 * URL helpers — the single source of truth for links that are embedded
 * elsewhere (QR codes, print sheets).
 */

export function publicAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function songUrl(slug: string): string {
  return `${publicAppUrl()}/songs/${slug}`;
}

export function songQrPath(slug: string): string {
  return `/api/qr/${slug}`;
}

export function setLyricsPath(id: string): string {
  return `/program/${id}/lyrics`;
}

export function setLyricsUrl(id: string): string {
  return `${publicAppUrl()}${setLyricsPath(id)}`;
}

export function setQrPath(id: string): string {
  return `/api/qr/set/${id}`;
}
