import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$6 } from "./router-EuZSQXDo.mjs";
import { a as cn, d as useArchive, i as artistsLabel, l as showsLabel, t as AppShell, u as todayIso } from "./format-DrKsHGab.mjs";
import { t as computeStats } from "./stats-B0Qo2a-s.mjs";
import { n as Skeleton, t as EmptyArchive } from "./skeleton-DruUs40o.mjs";
import { t as ConcertCard } from "./concert-card-BKiZZoIU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BUtyP3Kj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { q: qParam } = Route$6.useSearch();
	const hasHydrated = useArchive((s) => s.hasHydrated);
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const seedDemo = useArchive((s) => s.seedDemo);
	const [year, setYear] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)(qParam ?? "");
	const stats = (0, import_react.useMemo)(() => computeStats(concerts, artists), [concerts, artists]);
	const years = (0, import_react.useMemo)(() => [...new Set(concerts.map((c) => c.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a)), [concerts]);
	const today = todayIso();
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return concerts.filter((c) => year === "all" ? true : c.date.startsWith(year)).filter((c) => {
			if (!needle) return true;
			return c.lineup.map((l) => artists[l.artistId]?.name ?? "").join(" ").toLowerCase().includes(needle) || c.venue.toLowerCase().includes(needle) || c.city.toLowerCase().includes(needle);
		}).sort((a, b) => b.date.localeCompare(a.date));
	}, [
		concerts,
		artists,
		year,
		q
	]);
	const upcoming = filtered.filter((c) => c.date > today);
	const past = filtered.filter((c) => c.date <= today);
	const groups = /* @__PURE__ */ new Map();
	for (const c of past) {
		const y = c.date.slice(0, 4);
		const list = groups.get(y) ?? [];
		list.push(c);
		groups.set(y, list);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Arhiva live"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl font-medium tracking-tight md:text-5xl",
				children: "Concertele tale"
			}),
			hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: [
					showsLabel(stats.totalShows),
					" · ",
					artistsLabel(stats.uniqueArtists)
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-4 w-40" })
		]
	}), !hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-2xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-2xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-2xl" })
		]
	}) : concerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyArchive, { onSeed: seedDemo }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Caută formație, locație, oraș",
				className: "flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearChip, {
					active: year === "all",
					onClick: () => setYear("all"),
					children: "Toți anii"
				}), years.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearChip, {
					active: year === y,
					onClick: () => setYear(y),
					children: y
				}, y))]
			})]
		}),
		upcoming.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-xs font-medium uppercase tracking-wider text-subtle",
				children: "Urmează"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: upcoming.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConcertCard, {
					concert: c,
					artists
				}, c.id))
			})]
		}) : null,
		[...groups.entries()].map(([y, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-2xl font-medium",
				children: y
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConcertCard, {
					concert: c,
					artists
				}, c.id))
			})]
		}, y)),
		!filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "Nimic nu se potrivește cu filtrul ăsta."
		}) : null
	] })] });
}
function YearChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors duration-150", active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
		children
	});
}
//#endregion
export { Home as component };
