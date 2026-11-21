/** Serializable props for the display surface (all cached reads, no Dates). */

export type DisplayBranding = {
  title: string;
  tagline: string | null;
  dateText: string | null;
  venue: string | null;
};

export type DisplayProgramItem = {
  id: string;
  title: string;
  description: string | null;
};

export type DisplaySong = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
};

export type DisplayPost = {
  id: string;
  imageUrl: string | null;
  caption: string | null;
};
