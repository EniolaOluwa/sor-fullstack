import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeProps = {
  tone?: "neutral" | "gold" | "burgundy" | "red" | "success";
  children: ReactNode;
};

export default function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
