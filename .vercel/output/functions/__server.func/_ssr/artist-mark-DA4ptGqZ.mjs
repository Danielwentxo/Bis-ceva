import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cn } from "./format-DrKsHGab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/artist-mark-DA4ptGqZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SIZE = {
	xs: "size-8",
	sm: "size-10",
	md: "size-12",
	lg: "size-16",
	xl: "size-24",
	hero: "size-36"
};
var RADIUS = {
	xs: "rounded-md",
	sm: "rounded-lg",
	md: "rounded-lg",
	lg: "rounded-xl",
	xl: "rounded-2xl",
	hero: "rounded-3xl"
};
var TEXT = {
	xs: "text-xs",
	sm: "text-sm",
	md: "text-base",
	lg: "text-xl",
	xl: "text-3xl",
	hero: "text-5xl"
};
function initial(name) {
	const trimmed = name.trim();
	if (!trimmed) return "?";
	const parts = trimmed.split(/\s+/);
	if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
	return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
}
function ArtistMark({ artist, size = "md", className }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const name = artist?.name ?? "";
	const logo = artist?.logoUrl;
	const thumb = artist?.thumbUrl;
	const src = !failed ? logo ?? thumb : null;
	const isLogo = Boolean(logo) && src === logo;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative shrink-0 overflow-hidden bg-secondary shadow-[var(--shadow-border)]", SIZE[size], RADIUS[size], className),
		"aria-hidden": !name,
		children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			className: cn("size-full", isLogo ? "object-contain p-1.5" : "object-cover"),
			onError: () => setFailed(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex size-full items-center justify-center font-display font-medium text-primary", TEXT[size]),
			children: initial(name)
		})
	});
}
function ArtistStack({ artists, size = "sm" }) {
	const shown = artists.filter(Boolean).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center",
		children: shown.map((artist, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(i > 0 && "-ml-2"),
			style: { zIndex: shown.length - i },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistMark, {
				artist,
				size,
				className: "ring-2 ring-background"
			})
		}, `${artist.name}-${i}`))
	});
}
//#endregion
export { ArtistStack as n, ArtistMark as t };
