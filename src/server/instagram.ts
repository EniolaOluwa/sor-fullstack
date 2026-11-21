import "server-only";
import { saveBuffer } from "./media";

/**
 * Optional Instagram oEmbed auto-fill. Without IG_OEMBED_TOKEN this returns
 * null and the admin uploads the projection image manually — which is the
 * primary flow.
 */

type ResolvedPost = {
  caption: string | null;
  imagePath: string | null;
};

export async function resolveInstagramPost(
  url: string,
): Promise<ResolvedPost | null> {
  const token = process.env.IG_OEMBED_TOKEN;
  if (!token) return null;

  try {
    const endpoint = new URL("https://graph.facebook.com/v21.0/instagram_oembed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("access_token", token);

    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      author_name?: string;
      thumbnail_url?: string;
    };

    let imagePath: string | null = null;
    if (data.thumbnail_url) {
      const imageResponse = await fetch(data.thumbnail_url, {
        cache: "no-store",
      });
      if (imageResponse.ok) {
        const buffer = Buffer.from(await imageResponse.arrayBuffer());
        imagePath = await saveBuffer(buffer, "image/jpeg");
      }
    }

    return { caption: data.author_name ?? null, imagePath };
  } catch {
    // Auto-fill is best-effort; the manual upload path always works.
    return null;
  }
}
