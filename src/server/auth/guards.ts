import "server-only";
import { findUserById } from "@/server/services/users";
import { getSession } from "./session";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Returns the signed-in admin, or null. Pages redirect to the login screen;
 * server actions and route handlers use `requireAdmin()` instead.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Throws unless the request is authenticated. Use in every mutation. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
