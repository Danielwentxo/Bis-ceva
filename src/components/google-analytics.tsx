import { useEffect } from "react";

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID || !GA_ID.startsWith("G-")) return;
    if (document.getElementById("ga4-src")) return;

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);

    const script = document.createElement("script");
    script.id = "ga4-src";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }, []);
  return null;
}
