import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useArchive, i as artistsLabel, l as showsLabel, o as countriesLabel, p as venuesLabel, s as formatConcertDate, t as AppShell } from "./format-DrKsHGab.mjs";
import { t as ArtistMark } from "./artist-mark-DA4ptGqZ.mjs";
import { t as computeStats } from "./stats-B0Qo2a-s.mjs";
import { n as Skeleton, t as EmptyArchive } from "./skeleton-DruUs40o.mjs";
import { t as CountryFlag } from "./country-flag-BdrunLbZ.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-xUhrFJrM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MONTHS = [
	"Ian",
	"Feb",
	"Mar",
	"Apr",
	"Mai",
	"Iun",
	"Iul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function StatsPage() {
	const hasHydrated = useArchive((s) => s.hasHydrated);
	const concerts = useArchive((s) => s.concerts);
	const artists = useArchive((s) => s.artists);
	const seedDemo = useArchive((s) => s.seedDemo);
	const stats = (0, import_react.useMemo)(() => computeStats(concerts, artists), [concerts, artists]);
	const topArtist = stats.artistCounts[0];
	const topVenue = stats.venueCounts[0];
	const topCountry = stats.countryCounts[0];
	const topCity = stats.cityCounts[0];
	const yearData = stats.yearCounts.map((y) => ({
		name: String(y.year),
		count: y.count
	}));
	const monthData = stats.monthCounts.map((m) => ({
		name: MONTHS[m.month],
		count: m.count
	}));
	if (!hasHydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid grid-cols-2 gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-2xl" })]
	})] });
	if (!concerts.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyArchive, { onSeed: seedDemo }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Bilanțul scenei"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl font-medium tracking-tight",
				children: "Statistici"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
					label: "Concerte",
					value: String(stats.totalShows)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
					label: "Formații",
					value: String(stats.uniqueArtists)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
					label: "Locații",
					value: String(stats.uniqueVenues)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
					label: "Țări",
					value: String(stats.uniqueCountries)
				})
			]
		}),
		topArtist ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/artists/$slug",
			params: { slug: topArtist.data.id },
			className: "mt-6 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
				artist: topArtist.data,
				size: "xl"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-subtle",
						children: "Cea mai văzută formație"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-2xl font-medium",
						children: topArtist.data.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: showsLabel(topArtist.count)
					})
				]
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-3 sm:grid-cols-2",
			children: [
				topVenue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					kicker: "Cea mai vizitată locație",
					title: topVenue.data.venue,
					body: `${topVenue.data.city} · ${showsLabel(topVenue.count)}`,
					flag: topVenue.data.countryCode
				}) : null,
				topCity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					kicker: "Cel mai vizitat oraș",
					title: topCity.data.city,
					body: `${topCity.data.country} · ${showsLabel(topCity.count)}`,
					flag: topCity.data.countryCode
				}) : null,
				topCountry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					kicker: "Țara cu cele mai multe concerte",
					title: topCountry.data.country,
					body: showsLabel(topCountry.count),
					flag: topCountry.data.countryCode
				}) : null,
				stats.busiestYear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					kicker: "Anul cel mai plin",
					title: String(stats.busiestYear.year),
					body: showsLabel(stats.busiestYear.count)
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-xl font-medium",
				children: "Concerte pe ani"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: yearData,
						margin: {
							top: 8,
							right: 4,
							left: -18,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "color-mix(in oklab, var(--color-foreground) 6%, transparent)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "name",
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 12
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								allowDecimals: false,
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 12
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "color-mix(in oklab, var(--color-foreground) 4%, transparent)" },
								contentStyle: {
									background: "var(--color-popover)",
									border: "1px solid var(--color-border)",
									borderRadius: 12,
									color: "var(--color-foreground)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								name: "Concerte",
								fill: "var(--color-primary)",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-xl font-medium",
				children: "Luna preferată"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-48",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: monthData,
						margin: {
							top: 8,
							right: 4,
							left: -18,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "color-mix(in oklab, var(--color-foreground) 6%, transparent)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "name",
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								allowDecimals: false,
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 12
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "color-mix(in oklab, var(--color-foreground) 4%, transparent)" },
								contentStyle: {
									background: "var(--color-popover)",
									border: "1px solid var(--color-border)",
									borderRadius: 12,
									color: "var(--color-foreground)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								name: "Concerte",
								fill: "var(--color-muted-foreground)",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium",
				children: "Top formații"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-2",
				children: stats.artistCounts.slice(0, 8).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/artists/$slug",
					params: { slug: row.data.id },
					className: "flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 text-center text-sm tabular-nums text-subtle",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
							artist: row.data,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: row.data.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm tabular-nums text-muted-foreground",
							children: row.count
						})
					]
				}) }, row.key))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-xl font-medium",
				children: "Țări"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: stats.countryCounts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountryFlag, { code: row.data.countryCode }), row.data.country]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm tabular-nums text-muted-foreground",
						children: row.count
					})]
				}, row.key))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-8 grid gap-3 text-sm sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Primul concert",
					value: stats.firstShow ? `${formatConcertDate(stats.firstShow.date)}` : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Cel mai recent",
					value: stats.lastShow ? formatConcertDate(stats.lastShow.date) : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Festivale",
					value: String(stats.festivals)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Notă medie",
					value: stats.avgRating ? stats.avgRating.toFixed(1) : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Orașe",
					value: String(stats.uniqueCities)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Favorite",
					value: String(stats.favorites)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-6 text-xs text-subtle",
			children: [
				showsLabel(stats.totalShows),
				" · ",
				artistsLabel(stats.uniqueArtists),
				" ·",
				" ",
				venuesLabel(stats.uniqueVenues),
				" · ",
				countriesLabel(stats.uniqueCountries)
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 flex flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
				onClick: () => {
					if (window.confirm("Înlocuiești arhiva cu exemplele de demonstrație?")) seedDemo();
				},
				children: "Reîncarcă exemplele"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
				onClick: () => {
					if (window.confirm("Ștergi toate concertele din acest dispozitiv?")) useArchive.getState().clearArchive();
				},
				children: "Golește arhiva"
			})]
		})
	] });
}
function StatTile({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-3xl font-medium tabular-nums",
			children: value
		})]
	});
}
function Highlight({ kicker, title, body, flag }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wider text-subtle",
				children: kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 flex items-center gap-2 font-display text-xl font-medium",
				children: [flag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountryFlag, {
					code: flag,
					className: "h-4 w-6"
				}) : null, title]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: body
			})
		]
	});
}
function Meta({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs uppercase tracking-wider text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-medium",
			children: value
		})]
	});
}
//#endregion
export { StatsPage as component };
