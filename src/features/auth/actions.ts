"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { verifyPassword } from "@/server/auth/password";
import { findUserByEmail } from "@/server/services/users";

export type LoginState = {
  error: string | null;
};

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const user = await findUserByEmail(parsed.data.email);
  const passwordOk = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordOk) {
    return { error: "Invalid email or password." };
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
