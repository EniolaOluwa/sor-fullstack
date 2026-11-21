import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmForm from "@/components/ui/ConfirmForm";
import formStyles from "@/components/ui/form.module.css";
import {
  deleteProgramItemAction,
  updateProgramItemAction,
} from "@/features/program/actions";
import { getActiveEvent } from "@/server/services/events";
import { getProgramItemFresh } from "@/server/services/program";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Edit program item — Admin",
};

export default async function EditProgramItemPage({
  params,
}: PageProps<"/admin/program/[id]">) {
  const { id } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const item = await getProgramItemFresh(event.id, id);
  if (!item) notFound();

  return (
    <div className={styles.page}>
      <Link href="/admin/program" className={styles.backLink}>
        ← Back to order of service
      </Link>

      <h1 className={styles.title}>Edit item</h1>

      <form action={updateProgramItemAction} className={styles.form}>
        <input type="hidden" name="id" value={item.id} />

        <label className={formStyles.field}>
          <span className={formStyles.label}>Title</span>
          <input
            className={formStyles.input}
            name="title"
            defaultValue={item.title}
            required
          />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Details</span>
          <textarea
            className={formStyles.textarea}
            name="description"
            rows={6}
            defaultValue={item.description ?? ""}
          />
          <span className={formStyles.hint}>
            One line per sub-item — lines render as a bulleted list.
          </span>
        </label>

        <label className={formStyles.checkboxRow}>
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={item.isVisible}
          />
          Visible to the audience
        </label>

        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className={styles.dangerZone}>
        <p className={styles.dangerLabel}>Danger zone</p>
        <ConfirmForm
          action={deleteProgramItemAction}
          message={`Delete "${item.title}"? This cannot be undone.`}
        >
          <input type="hidden" name="id" value={item.id} />
          <Button variant="danger" size="sm" type="submit">
            Delete item
          </Button>
        </ConfirmForm>
      </div>
    </div>
  );
}
