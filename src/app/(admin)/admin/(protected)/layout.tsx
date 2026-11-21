import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Button from "@/components/ui/Button";
import { logout } from "@/features/auth/actions";
import { getCurrentAdmin } from "@/server/auth/guards";
import styles from "./layout.module.css";

/**
 * Auth-gated admin shell. Reads the session on every request, so the segment
 * opts out of instant-navigation/static-shell validation (`instant = false`).
 * `connection()` defers rendering to request time before any session read, so
 * the session's time-dependent unseal never runs during a prerender pass.
 * `src/proxy.ts` handles the optimistic redirect for visitors with no
 * session cookie at all.
 */
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell} data-surface="admin">
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandSmall}>Sound of</span>{" "}
          <span className={styles.brandScript}>Revival</span>
        </Link>

        <nav className={styles.nav} aria-label="Admin">
          <Link href="/admin" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/program" className={styles.navLink}>
            Order of service
          </Link>
          <Link href="/admin/songs" className={styles.navLink}>
            Songs
          </Link>
        </nav>

        <div className={styles.footer}>
          <p className={styles.user}>{admin.name}</p>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
