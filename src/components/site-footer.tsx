import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

export function SiteFooter() {
  const { locale } = useI18n();
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-4 text-xs text-subtle">
      <span>{`© ${APP_NAME}`}</span>
      <Link to="/about" className="hover:text-foreground">{pageLabel(locale, "footerAbout")}</Link>
      <Link to="/privacy" className="hover:text-foreground">{pageLabel(locale, "footerPrivacy")}</Link>
      <Link to="/contact" className="hover:text-foreground">{pageLabel(locale, "footerContact")}</Link>
      <Link to="/transfer" className="hover:text-foreground">{pageLabel(locale, "footerTransfer")}</Link>
    </footer>
  );
}
