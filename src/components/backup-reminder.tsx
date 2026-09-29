import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "mgh-last-backup";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function BackupReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const last = raw ? Number(raw) : 0;
    setShow(!last || Date.now() - last > MONTH_MS);
  }, []);

  if (!show) return null;

  return (
    <div className="mb-6 rounded-2xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
      <p className="font-medium">Backup reminder</p>
      <p className="mt-1 text-muted-foreground">
        Once a month export Neon (or CSV from Import) so the archive is safe.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/transfer" className="rounded-lg bg-secondary px-3 py-1.5 text-sm">
          Open export
        </Link>
        <button
          type="button"
          className="rounded-lg bg-secondary px-3 py-1.5 text-sm"
          onClick={() => {
            localStorage.setItem(KEY, String(Date.now()));
            setShow(false);
          }}
        >
          I already backed up
        </button>
      </div>
    </div>
  );
}
