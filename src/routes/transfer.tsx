import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { useArchive } from "@/lib/store";
import { archiveToJson, concertsToCsv, draftsFromCsv, draftsFromJson, ticketFiles } from "@/lib/transfer";

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

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function TransferPage() {
  const { locale } = useI18n();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const addConcert = useArchive((s) => s.addConcert);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const tickets = ticketFiles(concerts);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const text = await file.text();
      const drafts = file.name.toLowerCase().endsWith(".json") ? draftsFromJson(text) : draftsFromCsv(text);
      if (!drafts.length) {
        setNote("No concerts found. Use date, artists, venue, city columns.");
        return;
      }
      let ok = 0;
      for (const draft of drafts) {
        await addConcert(draft);
        ok += 1;
      }
      toast.success(`${ok} concerts imported`);
      setNote(`${ok} concerts imported into your archive.`);
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
        <p className="text-sm text-muted-foreground">CSV for spreadsheets. JSON keeps lineups, notes and ticket photos.</p>
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
        {tickets.length ? (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">{tickets.length} ticket photos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tickets.map((t) => (
                <Button key={t.name} type="button" variant="outline" onClick={() => downloadDataUrl(t.name, t.dataUrl)}>
                  {t.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 space-y-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-medium">{extraLabel(locale, "importTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          CSV header: date, artists, venue, city, country, countryCode, festival, notes, rating.
          Artists separated by semicolon. Dates as YYYY-MM-DD. JSON from this app also works.
          Setlist.fm / Concert Archives: export their list to CSV first, then upload here.
        </p>
        <input
          type="file"
          accept=".csv,.json,text/csv,application/json"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        Ticket OCR is not automatic yet. Add the show, then attach the photo on the form.{" "}
        <Link to="/add" className="underline">Add concert</Link>
      </p>
    </AppShell>
  );
}
