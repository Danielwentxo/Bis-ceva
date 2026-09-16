import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cn, n as Button } from "./format-DrKsHGab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-DruUs40o.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card px-6 py-14 text-center shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-sm text-sm text-muted-foreground",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap items-center justify-center gap-3",
				children: action
			})
		]
	});
}
function EmptyArchive({ onSeed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Arhiva e goală",
		body: "Adaugă primul concert. Căutăm automat logo-ul formației din TheAudioDB și Deezer.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/add",
				children: "Adaugă concert"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			type: "button",
			onClick: onSeed,
			children: "Încarcă exemple"
		})] })
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-lg bg-secondary", className) });
}
//#endregion
export { Skeleton as n, EmptyArchive as t };
