import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$1 } from "./router-EuZSQXDo.mjs";
import { d as useArchive, l as showsLabel, n as Button, t as AppShell } from "./format-DrKsHGab.mjs";
import { t as ArtistMark } from "./artist-mark-DA4ptGqZ.mjs";
import { t as ConcertCard } from "./concert-card-BKiZZoIU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/artists._slug-DXZ_t1Ia.js
var import_jsx_runtime = require_jsx_runtime();
function ArtistDetail() {
	const { slug } = Route$1.useParams();
	const artists = useArchive((s) => s.artists);
	const concerts = useArchive((s) => s.concerts);
	const artist = artists[slug];
	const shows = concerts.filter((c) => c.lineup.some((l) => l.artistId === slug)).sort((a, b) => b.date.localeCompare(a.date));
	if (!artist) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted-foreground",
		children: "Formația nu e în arhivă."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/artists",
			children: "Înapoi"
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
					artist,
					size: "hero"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 font-display text-4xl font-medium tracking-tight",
					children: artist.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [artist.genre, artist.country].filter(Boolean).join(" · ") || "Formație văzută live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-subtle",
					children: showsLabel(shows.length)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/add",
						search: { artist: artist.id },
						children: "Adaugă un concert"
					})
				})
			]
		}),
		artist.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-sm leading-relaxed text-muted-foreground",
			children: artist.bio
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium",
				children: "Concerte"
			}), shows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConcertCard, {
				concert: c,
				artists
			}, c.id))]
		})
	] });
}
//#endregion
export { ArtistDetail as component };
