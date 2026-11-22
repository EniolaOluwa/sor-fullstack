import QRCode from "qrcode";
import { setLyricsUrl } from "@/lib/urls";

/**
 * SVG QR code for a set's public lyrics page. DB-free and deterministic — the
 * encoded URL only changes when NEXT_PUBLIC_APP_URL changes (a redeploy).
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/qr/set/[id]">,
) {
  const { id } = await ctx.params;

  const svg = await QRCode.toString(setLyricsUrl(id), {
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
