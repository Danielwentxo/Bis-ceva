import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, l as MapPin } from "../_libs/lucide-react.mjs";
import { s as formatConcertDate } from "./format-DrKsHGab.mjs";
import { n as ArtistStack } from "./artist-mark-DA4ptGqZ.mjs";
import { n as concertArtists } from "./stats-B0Qo2a-s.mjs";
import { t as Badge } from "./badge-Dkpo6ySI.mjs";
import { t as CountryFlag } from "./country-flag-BdrunLbZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/concert-card-BKiZZoIU.js
var import_jsx_runtime = require_jsx_runtime();
function ConcertCard({ concert, artists }) {
	const lineup = concertArtists(concert, artists);
	const names = lineup.map((l) => l.artist.name);
	const title = names[0] ?? "Concert";
	const rest = names.slice(1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/concerts/$id",
		params: { id: concert.id },
		className: "block rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistStack, {
				artists: lineup.map((l) => l.artist),
				size: "md"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate font-medium text-foreground",
							children: title
						}), concert.favorite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mt-0.5 size-3.5 shrink-0 fill-primary text-primary" }) : null]
					}),
					rest.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-sm text-muted-foreground",
						children: ["cu ", rest.join(", ")]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: formatConcertDate(concert.date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 flex items-center gap-1.5 truncate text-sm text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountryFlag, { code: concert.countryCode }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [
									concert.venue,
									" · ",
									concert.city
								]
							})
						]
					}),
					concert.festival ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "mt-2",
						variant: "outline",
						children: "Festival"
					}) : null
				]
			})]
		})
	});
}
//#endregion
export { ConcertCard as t };
