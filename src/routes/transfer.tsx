import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { useArchive } from "@/lib/store";
import { archiveToJson, concertsToCsv, decodeImportedText, draftsFromCsv, draftsFromJson } from "@/lib/transfer";

export const Route = createFileRoute("/transfer")({ component: TransferPage });

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function TransferPage() {
  const { locale } = useI18n();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const addConcert = useArchive((s) => s.addConcert);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const text = decodeImportedText(buffer);
      const drafts = file.name.toLowerCase().endsWith(".json") ? draftsFromJson(text) : draftsFromCsv(text);
      if (!drafts.length) {
        setNote("No concerts found. Use date, artists, venue, city columns.");
        return;
      }
      let ok = 0;
      for (const draft of drafts) {
        await addConcert(draft);
        ok += 1;
        setNote(`Importing ${ok} / ${drafts.length}…`);
      }
      const done = `Done. ${ok} concerts are in your archive.`;
      toast.success(done);
      setNote(`${done} Logos will fill in over the next minute.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not import this file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="text-sm text-muted-foreground">{extraLabel(locale, "transferLead")}</p>
      <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{extraLabel(locale, "transferTitle")}</h1>

      <section className="mt-8 space-y-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-medium">{extraLabel(locale, "exportTitle")}</h2>
        <p className="text-sm text-muted-foreground">CSV for spreadsheets. JSON keeps lineups and notes.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => download("gig-history.csv", concertsToCsv(concerts, artists), "text/csv")}>
            Download CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => download("gig-history.json", JSON.stringify(archiveToJson(concerts, artists), null, 2), "application/json")}
          >
            Download JSON
          </Button>
        </div>
      </section>

      <section className="mt-6 space-y-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-medium">{extraLabel(locale, "importTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          Accepted files: .csv and .json. Columns: date, artists, venue, city, country, countryCode, festival, notes, rating.
          Several artists on one row: separate with a semicolon. Dates as YYYY-MM-DD.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          disabled={busy}
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
          <span className="text-sm text-muted-foreground">{fileName ?? "No file chosen"}</span>
        </div>
        {note ? <p className="text-sm text-foreground">{note}</p> : null}
      </section>
    </AppShell>
  );
}
