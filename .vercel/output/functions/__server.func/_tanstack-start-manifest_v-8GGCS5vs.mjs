//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-8GGCS5vs.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/add",
			"/artists",
			"/stats",
			"/venues",
			"/concerts/$id"
		],
		preloads: ["/assets/index-DEIibpn4.js", "/assets/createLucideIcon-Be2ML8mG.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DEIibpn4.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-D4pP_Z_F.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/stats-u_IZ995D.js",
			"/assets/concert-card-CR48e289.js",
			"/assets/skeleton-Do3fO5-O.js"
		]
	},
	"/add": {
		filePath: "/workspace/src/routes/add.tsx",
		children: void 0,
		preloads: [
			"/assets/add-vJXZ8PVa.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/artist-mark-peXNrzJ0.js",
			"/assets/star-rating-DYHWK8os.js",
			"/assets/countries-DoHYLKSF.js"
		]
	},
	"/artists": {
		filePath: "/workspace/src/routes/artists.tsx",
		children: ["/artists/$slug"],
		preloads: [
			"/assets/artists-BTbpkBdq.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/artist-mark-peXNrzJ0.js",
			"/assets/stats-u_IZ995D.js",
			"/assets/skeleton-Do3fO5-O.js"
		]
	},
	"/stats": {
		filePath: "/workspace/src/routes/stats.tsx",
		children: void 0,
		preloads: [
			"/assets/stats-CpWhy2HM.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/artist-mark-peXNrzJ0.js",
			"/assets/country-flag-D3JVJ0Ua.js",
			"/assets/stats-u_IZ995D.js",
			"/assets/skeleton-Do3fO5-O.js"
		]
	},
	"/venues": {
		filePath: "/workspace/src/routes/venues.tsx",
		children: void 0,
		preloads: [
			"/assets/venues-CeEJkpsy.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/country-flag-D3JVJ0Ua.js",
			"/assets/stats-u_IZ995D.js",
			"/assets/skeleton-Do3fO5-O.js"
		]
	},
	"/artists/$slug": {
		filePath: "/workspace/src/routes/artists.$slug.tsx",
		children: void 0,
		preloads: ["/assets/artists._slug-B4gucLOI.js", "/assets/concert-card-CR48e289.js"]
	},
	"/concerts/$id": {
		filePath: "/workspace/src/routes/concerts.$id.tsx",
		children: void 0,
		preloads: [
			"/assets/concerts._id-C-VZdT4h.js",
			"/assets/format-8uNzxqL2.js",
			"/assets/star-CrhfVC0n.js",
			"/assets/artist-mark-peXNrzJ0.js",
			"/assets/star-rating-DYHWK8os.js",
			"/assets/badge-nXW19TQI.js",
			"/assets/country-flag-D3JVJ0Ua.js",
			"/assets/stats-u_IZ995D.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
