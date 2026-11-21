import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

export type SessionData = {
  userId?: string;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env and fill it in.",
    );
  }

  return {
    password,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
