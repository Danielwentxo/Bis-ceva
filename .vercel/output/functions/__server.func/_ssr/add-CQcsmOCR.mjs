import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Search, t as X } from "../_libs/lucide-react.mjs";
import { i as Route$5 } from "./router-EuZSQXDo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as cn, c as searchArtists, d as useArchive, n as Button, r as artistKey, t as AppShell, u as todayIso } from "./format-DrKsHGab.mjs";
import { t as ArtistMark } from "./artist-mark-DA4ptGqZ.mjs";
import { t as StarRating } from "./star-rating-BsWtTm6Z.mjs";
import { t as COUNTRIES } from "./countries-B1SZxW01.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-CQcsmOCR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type = "text", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-lg bg-secondary px-3 text-base text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-muted-foreground", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-lg bg-secondary px-3 py-2.5 text-base text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		...props
	});
}
function concertToForm(concert, artists) {
	return {
		date: concert.date,
		venue: concert.venue,
		city: concert.city,
		countryCode: concert.countryCode,
		notes: concert.notes,
		rating: concert.rating,
		favorite: concert.favorite,
		festival: concert.festival,
		artists: concert.lineup.map((l) => artists[l.artistId]).filter(Boolean).map((a) => ({
			name: a.name,
			logoUrl: a.logoUrl,
			thumbUrl: a.thumbUrl,
			genre: a.genre,
			country: a.country,
			bio: a.bio
		}))
	};
}
function ConcertForm({ existing, presetArtist }) {
	const navigate = useNavigate();
	const archiveArtists = useArchive((s) => s.artists);
	const concerts = useArchive((s) => s.concerts);
	const addConcert = useArchive((s) => s.addConcert);
	const updateConcert = useArchive((s) => s.updateConcert);
	const [form, setForm] = (0, import_react.useState)(() => existing ? concertToForm(existing, archiveArtists) : {
		date: todayIso(),
		venue: "",
		city: "",
		countryCode: "RO",
		notes: "",
		rating: null,
		favorite: false,
		festival: false,
		artists: presetArtist ? [presetArtist] : []
	});
	const [query, setQuery] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 2) {
			setHits([]);
			return;
		}
		let cancelled = false;
		const t = window.setTimeout(() => {
			setSearching(true);
			searchArtists({ data: { query: q } }).then((rows) => {
				if (!cancelled) setHits(rows);
			}).catch(() => {
				if (!cancelled) setHits([]);
			}).finally(() => {
				if (!cancelled) setSearching(false);
			});
		}, 280);
		return () => {
			cancelled = true;
			window.clearTimeout(t);
		};
	}, [query]);
	const venueSuggestions = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Map();
		for (const c of concerts) {
			const key = `${c.venue}|${c.city}`;
			if (!seen.has(key)) seen.set(key, {
				venue: c.venue,
				city: c.city,
				countryCode: c.countryCode
			});
		}
		const q = form.venue.trim().toLowerCase();
		return [...seen.values()].filter((v) => !q || v.venue.toLowerCase().includes(q)).slice(0, 5);
	}, [concerts, form.venue]);
	const selectedIds = new Set(form.artists.map((a) => artistKey(a.name)));
	const country = COUNTRIES.find((c) => c.code === form.countryCode);
	function addArtist(hit) {
		if (selectedIds.has(artistKey(hit.name))) return;
		setForm((f) => ({
			...f,
			artists: [...f.artists, hit]
		}));
		setQuery("");
		setHits([]);
	}
	function removeArtist(name) {
		setForm((f) => ({
			...f,
			artists: f.artists.filter((a) => a.name !== name)
		}));
	}
	function submit(e) {
		e.preventDefault();
		if (!form.date) {
			setError("Alege data concertului.");
			return;
		}
		if (!form.artists.length) {
			setError("Adaugă cel puțin o formație.");
			return;
		}
		if (!form.venue.trim() || !form.city.trim()) {
			setError("Completează locația și orașul.");
			return;
		}
		const draft = {
			date: form.date,
			venue: form.venue,
			city: form.city,
			country: country?.name ?? form.countryCode,
			countryCode: form.countryCode,
			artists: form.artists,
			notes: form.notes,
			rating: form.rating,
			favorite: form.favorite,
			festival: form.festival
		};
		if (existing) {
			updateConcert(existing.id, draft);
			toast.success("Concert actualizat");
			navigate({
				to: "/concerts/$id",
				params: { id: existing.id }
			});
		} else {
			const id = addConcert(draft);
			toast.success("Concert adăugat în arhivă");
			navigate({
				to: "/concerts/$id",
				params: { id }
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "date",
					children: "Data"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "date",
					type: "date",
					value: form.date,
					onChange: (e) => setForm((f) => ({
						...f,
						date: e.target.value
					})),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "artist-search",
						children: "Formații"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Prima din listă e cap de afiș. Logo-urile vin din TheAudioDB și Deezer."
					}),
					form.artists.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: form.artists.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
									artist: a,
									size: "sm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: a.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [i === 0 ? "Cap de afiș" : "Invitat", a.genre ? ` · ${a.genre}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground",
									onClick: () => removeArtist(a.name),
									"aria-label": `Scoate ${a.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								})
							]
						}, a.name))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "artist-search",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Caută Metallica, Phoenix, Golan…",
							className: "pl-10",
							autoComplete: "off"
						})]
					}),
					(searching || hits.length > 0) && query.trim().length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "overflow-hidden rounded-xl bg-popover shadow-[var(--shadow-border)]",
						children: [searching && !hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-3 py-3 text-sm text-muted-foreground",
							children: "Căutăm logo-uri…"
						}) : null, hits.map((hit) => {
							const taken = selectedIds.has(artistKey(hit.name));
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: taken,
								onClick: () => addArtist(hit),
								className: cn("flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary", taken && "opacity-40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
									artist: hit,
									size: "sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: hit.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: [hit.genre, hit.country].filter(Boolean).join(" · ") || "Fără detalii extra"
									})]
								})]
							}) }, hit.name);
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "venue",
						children: "Locație"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "venue",
						value: form.venue,
						onChange: (e) => setForm((f) => ({
							...f,
							venue: e.target.value
						})),
						placeholder: "Romexpo, Control Club, Untold…",
						required: true
					}),
					form.venue && venueSuggestions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: venueSuggestions.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground",
							onClick: () => setForm((f) => ({
								...f,
								venue: v.venue,
								city: v.city,
								countryCode: v.countryCode
							})),
							children: [
								v.venue,
								" · ",
								v.city
							]
						}, `${v.venue}-${v.city}`))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "city",
						children: "Oraș"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "city",
						value: form.city,
						onChange: (e) => setForm((f) => ({
							...f,
							city: e.target.value
						})),
						placeholder: "București",
						required: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "country",
						children: "Țară"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "country",
						value: form.countryCode,
						onChange: (e) => setForm((f) => ({
							...f,
							countryCode: e.target.value
						})),
						className: "flex h-11 w-full rounded-lg bg-secondary px-3 text-base text-foreground shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:text-sm",
						children: COUNTRIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.code,
							children: c.name
						}, c.code))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-11 items-center gap-3 rounded-xl bg-card px-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: form.festival,
					onChange: (e) => setForm((f) => ({
						...f,
						festival: e.target.checked
					})),
					className: "size-4 accent-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "A fost festival"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-11 items-center gap-3 rounded-xl bg-card px-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: form.favorite,
					onChange: (e) => setForm((f) => ({
						...f,
						favorite: e.target.checked
					})),
					className: "size-4 accent-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "Marchează ca favorit"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notă" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarRating, {
					value: form.rating,
					onChange: (rating) => setForm((f) => ({
						...f,
						rating
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "notes",
					children: "Însemnări"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "notes",
					value: form.notes,
					onChange: (e) => setForm((f) => ({
						...f,
						notes: e.target.value
					})),
					placeholder: "Setlist, oameni, vreme, ce a rămas."
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "flex-1",
					children: existing ? "Salvează" : "Adaugă în arhivă"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => {
						if (existing) navigate({
							to: "/concerts/$id",
							params: { id: existing.id }
						});
						else navigate({ to: "/" });
					},
					children: "Anulează"
				})]
			})
		]
	});
}
function AddPage() {
	const { id, artist: artistId } = Route$5.useSearch();
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const existing = id ? concerts.find((c) => c.id === id) : void 0;
	const preset = artistId ? artists[artistId] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium text-muted-foreground",
			children: existing ? "Editează" : "Intrare nouă"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-4xl font-medium tracking-tight",
			children: existing ? "Modifică concertul" : "Adaugă concert"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConcertForm, {
		existing,
		presetArtist: preset ? {
			name: preset.name,
			logoUrl: preset.logoUrl,
			thumbUrl: preset.thumbUrl,
			genre: preset.genre,
			country: preset.country,
			bio: preset.bio
		} : null
	})] });
}
//#endregion
export { AddPage as component };
