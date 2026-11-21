"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import { login, type LoginState } from "./actions";
import styles from "./LoginForm.module.css";

const initialState: LoginState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className={styles.submit}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
