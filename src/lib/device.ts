/**
 * Minimal, dependency-free User-Agent parsing for first-party analytics.
 * Good enough for device type / OS / browser breakdowns.
 */

export type DeviceType = "mobile" | "tablet" | "desktop";

export type DeviceInfo = {
  deviceType: DeviceType;
  os: string;
  browser: string;
};

const BOT_PATTERN =
  /bot|crawler|spider|facebookexternalhit|preview|slurp|bing|duckduck|headless|phantom|python|curl|wget|axios|node-fetch|monitor|uptime/i;

export function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

export function parseDevice(userAgent: string): DeviceInfo {
  const ua = userAgent || "";

  const deviceType: DeviceType =
    /ipad|tablet|playbook|silk/i.test(ua) ||
    (/android/i.test(ua) && !/mobile/i.test(ua))
      ? "tablet"
      : /mobile|iphone|ipod|android|blackberry|iemobile|opera mini|windows phone/i.test(
            ua,
          )
        ? "mobile"
        : "desktop";

  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /windows/i.test(ua)
        ? "Windows"
        : /cros/i.test(ua)
          ? "ChromeOS"
          : /mac os x|macintosh/i.test(ua)
            ? "macOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "Unknown";

  // Order matters: Edge/Opera spoof "Chrome", and Chrome spoofs "Safari".
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /safari/i.test(ua)
            ? "Safari"
            : "Unknown";

  return { deviceType, os, browser };
}
