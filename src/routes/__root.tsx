import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { I18nProvider } from "@/lib/i18n";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { APP_NAME } from "@/lib/brand";
import appCss from "../styles.css?url";

function RegisterPwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}

const SEO_TITLE = "My Gig History \u2014 private concert archive and gig diary";
const SEO_DESC =
  "A private concert archive and gig diary. Log live shows and festivals, import a CSV list, and see stats. Not a ticket shop.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESC },
      { name: "keywords", content: "concert archive, gig archive, gig diary, festival log, live music journal, concert list" },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mygighistory.com/" },
      { property: "og:image", content: "https://mygighistory.com/og.jpg" },
      { name: "theme-color", content: "#0c0b0a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <RegisterPwa />
        <GoogleAnalytics />
        <PreviewHostBridge />
        <I18nProvider>
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  ),
});
