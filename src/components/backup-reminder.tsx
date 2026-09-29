import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const KEY = "mgh-last-backup";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function isOwner(email: string | null | undefined) {
  const value = email?.trim().toLowerCase() ?? "";
  return value === "danumbro@yahoo.com" || value.endsWith("@mygighistory.com");
}

export function BackupReminder() {
  const user = useCurrentUser();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOwner(user?.primaryEmail)) {
      setShow(false);
      return;
    }
    const raw = localStorage.getItem(KEY);
    const last = raw ? Number(raw) : 0;
    setShow(!last || Date.now() - last > MONTH_MS);
  }, [user?.primaryEmail]);

  if (!show) return null;

  return (
    <div className="mb-6 rounded-2xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
      <p className="font-medium">Backup reminder</p>
      <p className="mt-1 text-muted-foreground">
        Once a month make a Neon snapshot so the database is safe. This note is only visible to you.
      </p>
      <button
        type="button"
        className="mt-3 rounded-lg bg-secondary px-3 py-1.5 text-sm"
        onClick={() => {
          localStorage.setItem(KEY, String(Date.now()));
          setShow(false);
        }}
      >
        I already backed up
      </button>
    </div>
  );
}
