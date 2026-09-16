import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useArchive, l as showsLabel, p as venuesLabel, t as AppShell } from "./format-DrKsHGab.mjs";
import { t as computeStats } from "./stats-B0Qo2a-s.mjs";
import { n as Skeleton, t as EmptyArchive } from "./skeleton-DruUs40o.mjs";
import { t as CountryFlag } from "./country-flag-BdrunLbZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/venues-DOTPAORs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VenuesPage() {
	const hasHydrated = useArchive((s) => s.hasHydrated);
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const seedDemo = useArchive((s) => s.seedDemo);
	const stats = (0, import_react.useMemo)(() => computeStats(concerts, artists), [concerts, artists]);
	const byCountry = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of stats.venueCounts) {
			const key = row.data.country;
			const list = map.get(key) ?? [];
			list.push(row);
			map.set(key, list);
		}
		return [...map.entries()];
	}, [stats.venueCounts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Săli, cluburi, arene"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl font-medium tracking-tight",
				children: "Locuri"
			}),
			hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: venuesLabel(stats.uniqueVenues)
			}) : null
		]
	}), !hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-2xl" })]
	}) : concerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyArchive, { onSeed: seedDemo }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-8",
		children: byCountry.map(([country, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 font-display text-2xl font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountryFlag, { code: rows[0]?.data.countryCode ?? "" }), country]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				search: { q: row.data.venue },
				className: "flex items-center justify-between rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium",
						children: row.data.venue
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: row.data.city
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "ml-3 shrink-0 text-sm tabular-nums text-muted-foreground",
					children: showsLabel(row.count)
				})]
			}) }, row.key))
		})] }, country))
	})] });
}
//#endregion
export { VenuesPage as component };
