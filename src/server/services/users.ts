import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, type NewUser, type User } from "../db/schema";

/**
 * User lookups for auth. Not cached here on purpose: callers wrap session reads
 * in `'use cache: private'` per the Cache Components auth guide.
 */

export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user ?? null;
}

export async function createUser(values: NewUser) {
  const [user] = await db.insert(users).values(values).returning();
  return user;
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, id))
    .returning();

  return user;
}
