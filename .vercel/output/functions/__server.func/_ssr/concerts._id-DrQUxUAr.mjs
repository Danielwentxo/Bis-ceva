import { S as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, c as Pencil, l as MapPin, r as Trash2 } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-EuZSQXDo.mjs";
import { d as useArchive, n as Button, s as formatConcertDate, t as AppShell } from "./format-DrKsHGab.mjs";
import { t as ArtistMark } from "./artist-mark-DA4ptGqZ.mjs";
import { t as StarRating } from "./star-rating-BsWtTm6Z.mjs";
import { n as concertArtists } from "./stats-B0Qo2a-s.mjs";
import { t as Badge } from "./badge-Dkpo6ySI.mjs";
import { t as CountryFlag } from "./country-flag-BdrunLbZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/concerts._id-DrQUxUAr.js
var import_jsx_runtime = require_jsx_runtime();
function ConcertDetail() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const deleteConcert = useArchive((s) => s.deleteConcert);
	const toggleFavorite = useArchive((s) => s.toggleFavorite);
	const concert = concerts.find((c) => c.id === id);
	if (!concert) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted-foreground",
		children: "Concertul nu mai e în arhivă."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			children: "Înapoi la concerte"
		})
	})] });
	const lineup = concertArtists(concert, artists);
	const headliner = lineup[0]?.artist;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
					artist: headliner,
					size: "hero"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-sm text-muted-foreground",
					children: formatConcertDate(concert.date)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl font-medium tracking-tight",
					children: headliner?.name ?? "Concert"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-center gap-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountryFlag, { code: concert.countryCode }),
						concert.venue,
						" · ",
						concert.city,
						", ",
						concert.country
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center justify-center gap-2",
					children: [concert.festival ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Festival"
					}) : null, concert.favorite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "solid",
						children: "Favorit"
					}) : null]
				}),
				concert.rating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarRating, {
						value: concert.rating,
						size: "sm"
					})
				}) : null
			]
		}),
		lineup.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-xs font-medium uppercase tracking-wider text-subtle",
				children: "Afiș"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: lineup.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/artists/$slug",
					params: { slug: slot.artist.id },
					className: "flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
							artist: slot.artist,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: slot.artist.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-subtle",
							children: slot.role === "headliner" ? "Cap de afiș" : "Invitat"
						})
					]
				}) }, slot.artistId))
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/artists/$slug",
					params: { slug: headliner?.id ?? "" },
					children: "Vezi formația"
				})
			})
		}),
		concert.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium uppercase tracking-wider text-subtle",
				children: "Însemnări"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground",
				children: concert.notes
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 flex flex-wrap gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/add",
						search: { id: concert.id },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Editează"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => toggleFavorite(concert.id),
					"aria-label": "Favorit",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: concert.favorite ? "fill-primary text-primary" : "" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "destructive",
					onClick: () => {
						if (window.confirm("Ștergi concertul din arhivă?")) {
							deleteConcert(concert.id);
							navigate({ to: "/" });
						}
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})
			]
		})
	] });
}
//#endregion
export { ConcertDetail as component };
