import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Great_Vibes,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sound of Revival — Baze University Chapel",
  description:
    "Concert / Thanksgiving Service. Sunday 22 November, 3PM prompt, Baze University Multipurpose Hall.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${greatVibes.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
