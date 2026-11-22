"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "sor:visitorId";

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Fires a page-view beacon to /api/track on each audience navigation. Mounted
 * in the audience layout, so only public pages are tracked.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getVisitorId();
    const body = JSON.stringify({ path: pathname, visitorId });

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/track", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  }, [pathname]);

  return null;
}
