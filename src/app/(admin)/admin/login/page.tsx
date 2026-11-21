import type { Metadata } from "next";
import LoginForm from "@/features/auth/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin sign in — Sound of Revival",
};

export default function LoginPage() {
  return (
    <div className={styles.page} data-surface="admin">
      <div className={styles.card}>
        <p className={styles.kicker}>Sound of Revival</p>
        <h1 className={styles.title}>Admin sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
