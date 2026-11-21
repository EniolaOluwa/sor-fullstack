import QRCode from "qrcode";
import { songUrl } from "@/lib/urls";

/**
 * SVG QR code for a song's public page. DB-free and deterministic — the
 * encoded URL only changes when NEXT_PUBLIC_APP_URL changes (a redeploy).
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/qr/[slug]">,
) {
  const { slug } = await ctx.params;

  const svg = await QRCode.toString(songUrl(slug), {
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
