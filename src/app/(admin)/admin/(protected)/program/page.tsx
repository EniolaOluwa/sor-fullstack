import type { Metadata } from "next";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import formStyles from "@/components/ui/form.module.css";
import {
  clearLiveStateAction,
  createProgramItemAction,
  moveProgramItemAction,
  setCurrentProgramItemAction,
  toggleProgramItemVisibilityAction,
} from "@/features/program/actions";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listProgramItemsFresh } from "@/server/services/program";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Order of service — Admin",
};

export default async function AdminProgramPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Order of service</h1>
        <p className={styles.empty}>
          No active event. Seed the database with <code>yarn db:seed</code>.
        </p>
      </div>
    );
  }

  const [items, live] = await Promise.all([
    listProgramItemsFresh(event.id, { includeHidden: true }),
    getLiveState(event.id),
  ]);

  const currentItem =
    live?.mode === "program" && live.programItemId
      ? items.find((item) => item.id === live.programItemId)
      : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Order of service</h1>
          <p className={styles.status}>
            {currentItem ? (
              <>
                Live: <strong>{currentItem.title}</strong>
              </>
            ) : (
              "Not live — press “Set current” when the service reaches an item."
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {currentItem && (
            <form action={clearLiveStateAction}>
              <Button variant="secondary" size="sm" type="submit">
                Stop live
              </Button>
            </form>
          )}
          <Link href="/program" className={styles.viewLink} target="_blank">
            View public page ↗
          </Link>
        </div>
      </header>

      <section className={styles.createCard}>
        <h2 className={styles.sectionTitle}>Add item</h2>
        <form action={createProgramItemAction} className={styles.createForm}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Title</span>
            <input
              className={formStyles.input}
              name="title"
              placeholder="e.g. Opening Prayer"
              required
            />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Details</span>
            <textarea
              className={formStyles.textarea}
              name="description"
              rows={2}
              placeholder={"Optional — one line per sub-item\ne.g. Psalm 150"}
            />
          </label>
          <div>
            <Button type="submit">Add item</Button>
          </div>
        </form>
      </section>

      {items.length === 0 ? (
        <p className={styles.empty}>
          No items yet — add the first one above.
        </p>
      ) : (
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isCurrent = currentItem?.id === item.id;

            return (
              <li key={item.id} className={styles.row}>
                <span className={styles.position}>{index + 1}</span>

                <div className={styles.info}>
                  <div className={styles.titleRow}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    {isCurrent && <Badge tone="gold">Now</Badge>}
                    {!item.isVisible && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                  {item.description && (
                    <p className={styles.itemDescription}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className={styles.controls}>
                  <form action={moveProgramItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      aria-label={`Move ${item.title} up`}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                  </form>
                  <form action={moveProgramItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      aria-label={`Move ${item.title} down`}
                      disabled={index === items.length - 1}
                    >
                      ↓
                    </Button>
                  </form>
                  <form action={toggleProgramItemVisibilityAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="nextIsVisible"
                      value={String(!item.isVisible)}
                    />
                    <Button variant="ghost" size="sm" type="submit">
                      {item.isVisible ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <form action={setCurrentProgramItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="submit"
                      disabled={isCurrent}
                    >
                      Set current
                    </Button>
                  </form>
                  <Link
                    href={`/admin/program/${item.id}`}
                    className={styles.editLink}
                  >
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
