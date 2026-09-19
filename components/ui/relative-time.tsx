"use client";

import { useEffect, useState } from "react";

/**
 * A relative timestamp that is correct for the reader, not for whoever
 * happened to trigger the cache fill.
 *
 * "2h ago" computed in a server component is frozen into the cached HTML: the
 * homepage holds its document for 30 minutes, so a story could sit there
 * claiming to be 2h old when it is 2h29m old. Computing it after mount fixes
 * that without giving up the cache.
 *
 * The server-rendered string is kept as the initial value so the markup is
 * never empty, there is no layout shift when it upgrades, and a reader with
 * no JavaScript still gets something sensible. <time dateTime> carries the
 * real instant for machines either way.
 */
export function RelativeTime({
  iso,
  initial,
}: {
  iso: string;
  initial: string;
}) {
  const [label, setLabel] = useState(initial);

  useEffect(() => {
    const compute = () => setLabel(formatRelative(iso));
    compute();
    // Cheap enough to keep honest on a page left open.
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.max(0, Math.floor(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
