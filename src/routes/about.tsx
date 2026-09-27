import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <AppShell>
      <article className="prose-invert space-y-8">
        <header>
          <p className="text-sm text-muted-foreground">About & FAQ</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A private concert diary. Log the shows you went to, keep the lineup, and see your stats.
            It is not a ticket shop and not a public setlist wiki.
          </p>
        </header>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium">FAQ</h2>
          <Faq q="Is it free?" a="Yes. Sign in with email or Google. Your archive is included. There is no App Store fee." />
          <Faq
            q="Where is my archive stored?"
            a="In your account, in our database. Log in on another phone and the same concerts are there."
          />
          <Faq
            q="What files can I upload?"
            a="Images only, for a band logo or a festival poster: JPG, PNG or WebP. Large photos are resized automatically. Tickets are not uploaded. If an image is rejected, pick another picture."
          />
          <Faq
            q="How do I export my concerts?"
            a="Open Import / export from Stats (or the Transfer page). Download CSV for a spreadsheet, or JSON to keep lineups and notes. The file is only on your device."
          />
          <Faq
            q="How do I import a list?"
            a="Same page: Import your file. Accepted: .csv and .json. Useful columns: date, artists, venue, city, country. Several bands on one row: separate with a semicolon. Dates as YYYY-MM-DD. Festival days with empty dates stay with the last date above. After import you get a Done message."
          />
          <Faq
            q="Where do artist logos come from?"
            a="TheAudioDB, when the name matches exactly. If there is no logo, you see the band initials. You can add a band by hand and upload a logo. That logo is saved so other users can find it later. We do not take pictures from Deezer."
          />
          <Faq
            q="A band is missing from search. What do I do?"
            a="Use Add manually, then genre, country and Upload logo. Save. Next time the name should appear from our catalog."
          />
          <Faq
            q="What is Upcoming?"
            a="If you save a date in the future, the show sits under Upcoming. It is a reminder, not a ticket."
          />
          <Faq
            q="What is On this day?"
            a="On the home page we show shows you logged on this date in past years. Example: three years ago you were at Sziget."
          />
          <Faq
            q="How do festivals work?"
            a="Put the festival name on each day. Days stay grouped. Open a day with the arrow to see the lineup. Shared details (venue, city) can apply to every day of that festival."
          />
          <Faq
            q="Can I use it like an app on my phone?"
            a="Yes. In the browser menu choose Add to Home Screen. No App Store."
          />
          <Faq
            q="What does Share send?"
            a="Only totals: counts, top artists, countries, venues, genres. Not your email, notes or photos. You can share text or a card image."
          />
          <Faq
            q="Can I change language?"
            a="Yes, from the header, before or after login."
          />
          <Faq
            q="Can I delete everything?"
            a="Stats has Clear archive (concerts only) and Delete account (account, concerts and sessions). Delete account cannot be undone."
          />
        </section>
      </article>
    </AppShell>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
