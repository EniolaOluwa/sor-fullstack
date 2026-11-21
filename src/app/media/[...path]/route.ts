import { readMediaFile } from "@/server/media";

/**
 * Serves uploaded media from MEDIA_DIR. Filenames are UUIDs, so responses are
 * safe to cache immutably.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/media/[...path]">,
) {
  const { path: segments } = await ctx.params;
  const file = await readMediaFile(segments);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
