import "server-only";

/**
 * Optional Instagram oEmbed lookup used to embed the post's image in a
 * generated graphic. Without IG_OEMBED_TOKEN this returns null and the graphic
 * falls back to a branded placeholder — Instagram scraping is not allowed.
 */

type ResolvedPost = {
  authorName: string | null;
  imageDataUrl: string | null;
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

    let imageDataUrl: string | null = null;
    if (data.thumbnail_url) {
      const imageResponse = await fetch(data.thumbnail_url, {
        cache: "no-store",
      });
      if (imageResponse.ok) {
        const contentType =
          imageResponse.headers.get("content-type") ?? "image/jpeg";
        const buffer = Buffer.from(await imageResponse.arrayBuffer());
        imageDataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
      }
    }

    return { authorName: data.author_name ?? null, imageDataUrl };
  } catch {
    // Auto-fill is best-effort; the branded placeholder always works.
    return null;
  }
}
