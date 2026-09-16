import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useArchive, i as artistsLabel, l as showsLabel, t as AppShell } from "./format-DrKsHGab.mjs";
import { t as ArtistMark } from "./artist-mark-DA4ptGqZ.mjs";
import { t as computeStats } from "./stats-B0Qo2a-s.mjs";
import { n as Skeleton, t as EmptyArchive } from "./skeleton-DruUs40o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/artists-BjiBMNJT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtistsPage() {
	const hasHydrated = useArchive((s) => s.hasHydrated);
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const seedDemo = useArchive((s) => s.seedDemo);
	const [q, setQ] = (0, import_react.useState)("");
	const stats = (0, import_react.useMemo)(() => computeStats(concerts, artists), [concerts, artists]);
	const rows = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return stats.artistCounts.filter((row) => needle ? row.data.name.toLowerCase().includes(needle) : true);
	}, [stats.artistCounts, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Logo-uri din TheAudioDB"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl font-medium tracking-tight",
				children: "Formații"
			}),
			hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: artistsLabel(stats.uniqueArtists)
			}) : null
		]
	}), !hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl" }, i))
	}) : concerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyArchive, { onSeed: seedDemo }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		value: q,
		onChange: (e) => setQ(e.target.value),
		placeholder: "Caută o formație",
		className: "mb-5 flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/artists/$slug",
			params: { slug: row.data.id },
			className: "flex flex-col items-center rounded-2xl bg-card px-3 py-5 text-center shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
					artist: row.data,
					size: "xl"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 line-clamp-2 text-sm font-medium",
					children: row.data.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: showsLabel(row.count)
				})
			]
		}, row.key))
	})] })] });
}
//#endregion
export { ArtistsPage as component };
