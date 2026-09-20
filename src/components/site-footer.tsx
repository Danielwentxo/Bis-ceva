import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-4 text-xs text-subtle">
      <span>© {APP_NAME}</span>
      <Link to="/about" className="hover:text-foreground">About</Link>
      <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
      <Link to="/contact" className="hover:text-foreground">Contact</Link>
    </footer>
  );
}
