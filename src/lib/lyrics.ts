import type { LyricSection } from "@/server/db/schema";

/**
 * Songbook markup helpers. Lyrics are stored as structured sections; the admin
 * editor edits them as plain text using `[Section]` headers, so parsing and
 * formatting live here as pure functions shared by client and server.
 *
 *   [Verse 1]        → { type: "verse", label: "1" }
 *   [Chorus]         → { type: "chorus" }
 *   [Recitation by Michael] → { type: "recitation", label: "by Michael" }
 *   [Chants]         → { type: "tag", label: "Chants" }
 */

export const LYRIC_SECTION_TYPES = [
  "verse",
  "chorus",
  "bridge",
  "tag",
  "intro",
  "outro",
  "recitation",
] as const;

export function sectionHeading(section: LyricSection): string {
  const typeName = section.type.charAt(0).toUpperCase() + section.type.slice(1);
  if (section.type === "tag") return section.label ?? "Tag";
  return section.label ? `${typeName} ${section.label}` : typeName;
}

export function parseLyrics(text: string): LyricSection[] {
  const sections: LyricSection[] = [];
  let current: LyricSection | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    // Escaped literal bracket line (e.g. a stage direction like \[Chants]).
    const escaped = /^\\\[.*\]$/.exec(line);
    if (escaped) {
      current = appendLine(current, sections, line.slice(1));
      continue;
    }

    const header = /^\[(.+)\]$/.exec(line);
    if (header) {
      current = sectionFromHeader(header[1].trim());
      sections.push(current);
      continue;
    }

    current = appendLine(current, sections, line);
  }

  return sections.filter((section) => section.lines.length > 0);
}

function appendLine(
  current: LyricSection | null,
  sections: LyricSection[],
  line: string,
): LyricSection {
  if (current) {
    current.lines.push(line);
    return current;
  }
  const section: LyricSection = { type: "tag", lines: [line] };
  sections.push(section);
  return section;
}

function sectionFromHeader(inner: string): LyricSection {
  const [firstWord, ...rest] = inner.split(/\s+/);
  const known = LYRIC_SECTION_TYPES.find(
    (type) => type === firstWord.toLowerCase(),
  );

  if (!known) {
    return { type: "tag", label: inner, lines: [] };
  }

  const label = rest.join(" ");
  return { type: known, ...(label ? { label } : {}), lines: [] };
}

export function formatLyrics(sections: LyricSection[]): string {
  return sections
    .map(
      (section) =>
        `[${sectionHeading(section)}]\n${section.lines.map(escapeLine).join("\n")}`,
    )
    .join("\n\n");
}

/** Lines that look like section headers get a backslash so they stay literal. */
function escapeLine(line: string): string {
  return /^\[.*\]$/.test(line) ? `\\${line}` : line;
}
