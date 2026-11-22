import QRCode from "qrcode";
import { siteUrl } from "@/lib/urls";

/**
 * SVG QR code for the site root. DB-free and deterministic — the encoded URL
 * only changes when NEXT_PUBLIC_APP_URL changes (a redeploy).
 */
export async function GET() {
  const svg = await QRCode.toString(siteUrl(), {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
