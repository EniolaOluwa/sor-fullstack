import { ImageResponse } from "next/og";
import { extractInstagramShortcode } from "@/lib/instagram";
import { formatEventDate } from "@/lib/format";
import { getCurrentAdmin } from "@/server/auth/guards";
import { resolveInstagramPost } from "@/server/instagram";
import { getActiveEvent } from "@/server/services/events";

/**
 * Renders a downloadable, projectable social graphic for an Instagram post.
 * Authenticated admins only; the post image is embedded inline (data URL) when
 * IG_OEMBED_TOKEN is configured, otherwise a branded placeholder is used.
 */
export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = (searchParams.get("url") ?? "").trim();
  const caption = (searchParams.get("caption") ?? "").trim();

  if (!extractInstagramShortcode(url)) {
    return new Response("Enter a valid Instagram post, reel, or TV link.", {
      status: 400,
    });
  }

  const [event, resolved] = await Promise.all([
    getActiveEvent(),
    resolveInstagramPost(url),
  ]);

  const imageDataUrl = resolved?.imageDataUrl ?? null;
  const captionText = caption || resolved?.authorName || null;
  const dateText = event?.startsAt ? formatEventDate(event.startsAt) : null;
  const meta = [dateText, event?.venue].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 64,
          background: "linear-gradient(180deg, #0b1b45 0%, #12275a 100%)",
          color: "#fbf6ea",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 8, color: "#e3c558" }}>
            SOUND OF
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1 }}>
            Revival
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexGrow: 1,
            marginTop: 40,
            borderRadius: 24,
            overflow: "hidden",
            background: "#1b3a7a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDataUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ display: "flex", fontSize: 44, color: "#e3c558" }}>
              Instagram post
            </div>
          )}
        </div>

        {captionText && (
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 40,
              lineHeight: 1.3,
            }}
          >
            {captionText}
          </div>
        )}

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            color: "#e3c558",
          }}
        >
          {meta || "Baze University Chapel"}
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
