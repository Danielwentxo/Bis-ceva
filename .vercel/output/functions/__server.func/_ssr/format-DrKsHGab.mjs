import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as string, i as object, t as array } from "../_libs/zod.mjs";
import { d as ChartColumn, i as Ticket, l as MapPin, s as Plus, u as Disc3 } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { i as isValid, n as parseISO, r as format, t as ro } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-DrKsHGab.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var searchArtists = createServerFn({ method: "POST" }).validator(object({ query: string().trim().min(1).max(80) })).handler(createSsrRpc("0953cbb8aab4b2e8d6449bbc04970d13e3410c3831e1f3f1633c3177c3b43000"));
var enrichArtists = createServerFn({ method: "POST" }).validator(object({
	names: array(string().trim().min(1).max(80)).max(20),
	countryHint: string().trim().max(80).optional()
})).handler(createSsrRpc("7cd086ba5327cb686a1d0157fc1ff52fd338c3c9c5fc11d38bcc15b6b1bfd8bf"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function slugify(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function artistKey(name) {
	return slugify(name) || "artist";
}
function venueKey(venue, city) {
	return `${slugify(venue)}--${slugify(city)}`;
}
function artist(name, extras = {}) {
	return {
		id: extras.id ?? artistKey(name),
		name,
		logoUrl: extras.logoUrl ?? null,
		thumbUrl: extras.thumbUrl ?? null,
		genre: extras.genre ?? null,
		country: extras.country ?? null,
		bio: extras.bio ?? null
	};
}
var DEMO_ARTISTS = [
	artist("Metallica", {
		genre: "Thrash Metal",
		country: "SUA"
	}),
	artist("Phoenix", {
		genre: "Rock",
		country: "România"
	}),
	artist("Iron Maiden", {
		genre: "Heavy Metal",
		country: "Regatul Unit"
	}),
	artist("Depeche Mode", {
		genre: "Synth-pop",
		country: "Regatul Unit"
	}),
	artist("Arctic Monkeys", {
		genre: "Indie Rock",
		country: "Regatul Unit"
	}),
	artist("Radiohead", {
		genre: "Alternative Rock",
		country: "Regatul Unit"
	}),
	artist("Muse", {
		genre: "Alternative Rock",
		country: "Regatul Unit"
	}),
	artist("Coldplay", {
		genre: "Alternative Rock",
		country: "Regatul Unit"
	}),
	artist("The Weeknd", {
		genre: "R&B",
		country: "Canada"
	}),
	artist("Foo Fighters", {
		genre: "Rock",
		country: "SUA"
	}),
	artist("Florence + The Machine", {
		genre: "Indie Pop",
		country: "Regatul Unit"
	}),
	artist("Iris", {
		genre: "Rock",
		country: "România"
	}),
	artist("Golan", {
		genre: "Electropop",
		country: "România"
	}),
	artist("Cargo", {
		genre: "Hard Rock",
		country: "România"
	}),
	artist("Ghost", {
		genre: "Rock",
		country: "Suedia"
	}),
	artist("The Raven Age", {
		genre: "Metal",
		country: "Regatul Unit"
	}),
	artist("Travis Scott", {
		genre: "Hip Hop",
		country: "SUA"
	})
];
function lineup(headliner, supports = []) {
	return [{
		artistId: artistKey(headliner),
		role: "headliner"
	}, ...supports.map((name) => ({
		artistId: artistKey(name),
		role: "support"
	}))];
}
var DEMO_CONCERTS = [
	{
		id: "demo-phoenix-2014",
		date: "2014-12-06",
		venue: "Sala Palatului",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Phoenix"),
		notes: "Primul concert mare. Vocea lui Nicu Covaci încă umplea sala.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-radiohead-2016",
		date: "2016-08-12",
		venue: "Óbudai-sziget",
		city: "Budapesta",
		country: "Ungaria",
		countryCode: "HU",
		lineup: lineup("Radiohead"),
		notes: "Sziget, după-amiază toridă, A Moon Shaped Pool live.",
		rating: 5,
		favorite: true,
		festival: true,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-phoenix-2017",
		date: "2017-06-24",
		venue: "Arenele Romane",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Phoenix"),
		notes: "",
		rating: 4,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-arctic-2018",
		date: "2018-08-10",
		venue: "Domeniul Știrbey",
		city: "Buftea",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Arctic Monkeys"),
		notes: "Summer Well. Tranquility Base Hotel & Casino abia ieșise.",
		rating: 4,
		favorite: false,
		festival: true,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-metallica-2019",
		date: "2019-08-14",
		venue: "Romexpo",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Metallica", ["Ghost"]),
		notes: "WorldWired. Master of Puppets întreg.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-muse-2019",
		date: "2019-09-07",
		venue: "Romexpo",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Muse"),
		notes: "",
		rating: 4,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-phoenix-2021",
		date: "2021-09-18",
		venue: "Arenele Romane",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Phoenix"),
		notes: "Primul show după pauza de pandemie.",
		rating: 5,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-maiden-2022",
		date: "2022-05-29",
		venue: "Romexpo",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Iron Maiden", ["The Raven Age"]),
		notes: "Legacy of the Beast. Bruce încă zboară pe scenă.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-florence-2022",
		date: "2022-08-06",
		venue: "Cluj Arena",
		city: "Cluj-Napoca",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Florence + The Machine"),
		notes: "Untold, noaptea principală.",
		rating: 5,
		favorite: true,
		festival: true,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-iris-2022",
		date: "2022-10-15",
		venue: "Sala Palatului",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Iris"),
		notes: "",
		rating: 4,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-depeche-2023",
		date: "2023-06-10",
		venue: "Arena Națională",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Depeche Mode"),
		notes: "Memento Mori. Un show aproape liturgic.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-weeknd-2023",
		date: "2023-08-03",
		venue: "Cluj Arena",
		city: "Cluj-Napoca",
		country: "România",
		countryCode: "RO",
		lineup: lineup("The Weeknd"),
		notes: "Untold. After Hours până la Blinding Lights.",
		rating: 4,
		favorite: false,
		festival: true,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-golan-2024",
		date: "2024-03-22",
		venue: "Control Club",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Golan"),
		notes: "Club mic, sunet mare.",
		rating: 5,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-coldplay-2024",
		date: "2024-06-15",
		venue: "Arena Națională",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Coldplay"),
		notes: "Music of the Spheres. Brățările LED au aprins tot stadionul.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-foo-2024",
		date: "2024-07-20",
		venue: "BT Arena",
		city: "Cluj-Napoca",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Foo Fighters"),
		notes: "",
		rating: 4,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-metallica-2025",
		date: "2025-05-17",
		venue: "Olympiastadion",
		city: "Berlin",
		country: "Germania",
		countryCode: "DE",
		lineup: lineup("Metallica"),
		notes: "M72. Al doilea Metallica, alt continent muzical.",
		rating: 5,
		favorite: true,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-travis-2025",
		date: "2025-08-08",
		venue: "Cluj Arena",
		city: "Cluj-Napoca",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Travis Scott"),
		notes: "Untold, cap de afiș.",
		rating: 3,
		favorite: false,
		festival: true,
		createdAt: "2026-01-01T10:00:00.000Z"
	},
	{
		id: "demo-cargo-2026",
		date: "2026-04-12",
		venue: "Hard Rock Cafe",
		city: "București",
		country: "România",
		countryCode: "RO",
		lineup: lineup("Cargo"),
		notes: "Dacă pleci… live, aproape de scenă.",
		rating: 5,
		favorite: false,
		festival: false,
		createdAt: "2026-01-01T10:00:00.000Z"
	}
];
function createDemoArchive() {
	const artists = {};
	for (const a of DEMO_ARTISTS) artists[a.id] = { ...a };
	return {
		concerts: DEMO_CONCERTS.map((c) => ({
			...c,
			lineup: c.lineup.map((l) => ({ ...l }))
		})),
		artists
	};
}
function mediaToArtist(media) {
	return {
		id: artistKey(media.name),
		name: media.name,
		logoUrl: media.logoUrl,
		thumbUrl: media.thumbUrl,
		genre: media.genre,
		country: media.country,
		bio: media.bio,
		fetchedAt: media.logoUrl || media.thumbUrl || media.bio ? (/* @__PURE__ */ new Date()).toISOString() : void 0
	};
}
function fromDraft(id, draft, createdAt) {
	return {
		id,
		date: draft.date,
		venue: draft.venue.trim(),
		city: draft.city.trim(),
		country: draft.country,
		countryCode: draft.countryCode,
		lineup: draft.artists.map((a, index) => ({
			artistId: artistKey(a.name),
			role: index === 0 ? "headliner" : "support"
		})),
		notes: draft.notes.trim(),
		rating: draft.rating,
		favorite: draft.favorite,
		festival: draft.festival,
		createdAt
	};
}
var useArchive = create()(persist((set, get) => ({
	concerts: [],
	artists: {},
	seeded: false,
	hasHydrated: false,
	finishHydration: () => {
		if (get().hasHydrated) return;
		const { seeded, concerts } = get();
		if (!seeded && concerts.length === 0) {
			const demo = createDemoArchive();
			set({
				concerts: demo.concerts,
				artists: demo.artists,
				seeded: true,
				hasHydrated: true
			});
			return;
		}
		set({ hasHydrated: true });
	},
	upsertArtist: (media) => {
		const id = artistKey(media.name);
		set((state) => {
			const prev = state.artists[id];
			const next = {
				id,
				name: media.name || prev?.name || id,
				logoUrl: media.logoUrl ?? prev?.logoUrl ?? null,
				thumbUrl: media.thumbUrl ?? prev?.thumbUrl ?? null,
				genre: media.genre ?? prev?.genre ?? null,
				country: media.country ?? prev?.country ?? null,
				bio: media.bio ?? prev?.bio ?? null,
				fetchedAt: media.logoUrl || media.thumbUrl || media.bio ? (/* @__PURE__ */ new Date()).toISOString() : prev?.fetchedAt
			};
			return { artists: {
				...state.artists,
				[id]: next
			} };
		});
		return id;
	},
	applyArtistMedia: (hits) => {
		if (!hits.length) return;
		set((state) => {
			const artists = { ...state.artists };
			for (const hit of hits) {
				const id = artistKey(hit.name);
				const prev = artists[id];
				if (!prev) {
					artists[id] = mediaToArtist(hit);
					continue;
				}
				artists[id] = {
					...prev,
					logoUrl: hit.logoUrl ?? prev.logoUrl,
					thumbUrl: hit.thumbUrl ?? prev.thumbUrl,
					genre: hit.genre ?? prev.genre,
					country: hit.country ?? prev.country,
					bio: hit.bio ?? prev.bio,
					fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
			}
			return { artists };
		});
	},
	addConcert: (draft) => {
		const id = crypto.randomUUID();
		for (const a of draft.artists) get().upsertArtist(a);
		set((state) => ({ concerts: [fromDraft(id, draft, (/* @__PURE__ */ new Date()).toISOString()), ...state.concerts] }));
		return id;
	},
	updateConcert: (id, draft) => {
		for (const a of draft.artists) get().upsertArtist(a);
		set((state) => ({ concerts: state.concerts.map((c) => c.id === id ? fromDraft(id, draft, c.createdAt) : c) }));
	},
	deleteConcert: (id) => {
		set((state) => ({ concerts: state.concerts.filter((c) => c.id !== id) }));
	},
	toggleFavorite: (id) => {
		set((state) => ({ concerts: state.concerts.map((c) => c.id === id ? {
			...c,
			favorite: !c.favorite
		} : c) }));
	},
	seedDemo: () => {
		const demo = createDemoArchive();
		set({
			concerts: demo.concerts,
			artists: demo.artists,
			seeded: true
		});
	},
	clearArchive: () => {
		set({
			concerts: [],
			artists: {},
			seeded: true
		});
	}
}), {
	name: "bis-archive-v1",
	partialize: (state) => ({
		concerts: state.concerts,
		artists: state.artists,
		seeded: state.seeded
	}),
	onRehydrateStorage: () => (state, error) => {
		if (error || !state) {
			queueMicrotask(() => {
				useArchive.getState().finishHydration();
			});
			return;
		}
		state.finishHydration();
	}
}));
function useEnrichArtists() {
	const hasHydrated = useArchive((s) => s.hasHydrated);
	const artists = useArchive((s) => s.artists);
	const applyArtistMedia = useArchive((s) => s.applyArtistMedia);
	const running = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!hasHydrated || running.current) return;
		const missing = Object.values(artists).filter((a) => !a.fetchedAt);
		if (!missing.length) return;
		running.current = true;
		const batch = missing.slice(0, 12);
		enrichArtists({ data: {
			names: batch.map((a) => a.name),
			countryHint: "Romania"
		} }).then((hits) => {
			applyArtistMedia(hits);
			if (missing.slice(12).length) running.current = false;
		}).catch(() => {
			applyArtistMedia(batch.map((a) => ({
				...a,
				logoUrl: a.logoUrl,
				thumbUrl: a.thumbUrl
			})));
		}).finally(() => {
			running.current = false;
		});
	}, [
		hasHydrated,
		artists,
		applyArtistMedia
	]);
}
var NAV = [
	{
		to: "/",
		label: "Concerte",
		icon: Ticket
	},
	{
		to: "/artists",
		label: "Formății",
		icon: Disc3
	},
	{
		to: "/venues",
		label: "Locuri",
		icon: MapPin
	},
	{
		to: "/stats",
		label: "Statistici",
		icon: ChartColumn
	}
];
function navActive(pathname, to) {
	if (to === "/") return pathname === "/";
	return pathname === to || pathname.startsWith(`${to}/`);
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	useEnrichArtists();
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			if (!useArchive.getState().hasHydrated) useArchive.getState().finishHydration();
		}, 1200);
		return () => window.clearTimeout(t);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border px-4 py-6 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-8 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-medium tracking-tight text-foreground",
							children: "Bis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Arhiva ta de concerte"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = navActive(pathname, item.to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/add",
						className: "mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-150 active:scale-[0.96]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Adaugă concert"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-md md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-display text-2xl font-medium tracking-tight",
						children: "Bis"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/add",
						className: "inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground",
						"aria-label": "Adaugă concert",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-3xl px-4 pb-28 pt-6 md:pb-12 md:pt-10",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-4",
					children: NAV.map((item) => {
						const Icon = item.icon;
						const active = navActive(pathname, item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium", active ? "text-foreground" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
						}) }, item.to);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { className: "bg-popover text-popover-foreground border-border" }
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			ghost: "text-foreground hover:bg-secondary",
			outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-secondary",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function parseDate(value) {
	const d = parseISO(value);
	return isValid(d) ? d : null;
}
function formatConcertDate(value) {
	const d = parseDate(value);
	if (!d) return value;
	return format(d, "d MMMM yyyy", { locale: ro });
}
function todayIso() {
	return format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
}
function plural(n, one, few, many) {
	const abs = Math.abs(n);
	const mod100 = abs % 100;
	const mod10 = abs % 10;
	if (abs === 1) return `${n} ${one}`;
	if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${n} ${few}`;
	return `${n} ${many}`;
}
function showsLabel(n) {
	return plural(n, "concert", "concerte", "de concerte");
}
function artistsLabel(n) {
	return plural(n, "formație", "formații", "de formații");
}
function venuesLabel(n) {
	return plural(n, "locație", "locații", "de locații");
}
function countriesLabel(n) {
	return plural(n, "țară", "țări", "de țări");
}
//#endregion
export { cn as a, searchArtists as c, useArchive as d, venueKey as f, artistsLabel as i, showsLabel as l, Button as n, countriesLabel as o, venuesLabel as p, artistKey as r, formatConcertDate as s, AppShell as t, todayIso as u };
