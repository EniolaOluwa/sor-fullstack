import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

/**
 * Uploaded media (post images) lives in MEDIA_DIR — a persistent volume in
 * Dokploy — and is served through the /media/[...path] route handler.
 * Filenames are generated UUIDs, never user input.
 */

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const EXTENSION_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function mediaDir(): string {
  return path.resolve(process.env.MEDIA_DIR ?? "./data/media");
}

export async function saveBuffer(buffer: Buffer, mime: string): Promise<string> {
  const extension = MIME_EXTENSIONS[mime];
  if (!extension) {
    throw new Error(`Unsupported image type: ${mime}`);
  }

  const dir = mediaDir();
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${extension}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/media/${filename}`;
}

export async function saveUpload(file: File): Promise<string> {
  if (file.size === 0) throw new Error("The image file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Images must be 10 MB or smaller.");
  }
  if (!MIME_EXTENSIONS[file.type]) {
    throw new Error("Upload a JPEG, PNG, WebP, GIF, or AVIF image.");
  }

  return saveBuffer(Buffer.from(await file.arrayBuffer()), file.type);
}

/** Best-effort removal of a previously uploaded file. */
export async function deleteMedia(publicPath: string): Promise<void> {
  if (!publicPath.startsWith("/media/")) return;
  const filename = publicPath.slice("/media/".length);
  if (filename.includes("/") || filename.includes("..")) return;

  try {
    await unlink(path.join(mediaDir(), filename));
  } catch {
    // Already gone — fine.
  }
}

export async function readMediaFile(
  segments: string[],
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const dir = mediaDir();
  const target = path.resolve(dir, ...segments);

  // Path traversal guard: the resolved file must stay inside MEDIA_DIR.
  if (!target.startsWith(dir + path.sep)) return null;

  const contentType = EXTENSION_MIME[path.extname(target).toLowerCase()];
  if (!contentType) return null;

  try {
    const buffer = await readFile(target);
    return { buffer, contentType };
  } catch {
    return null;
  }
}
