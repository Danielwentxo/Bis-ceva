import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star } from "../_libs/lucide-react.mjs";
import { a as cn } from "./format-DrKsHGab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/star-rating-BsWtTm6Z.js
var import_jsx_runtime = require_jsx_runtime();
function StarRating({ value, onChange, size = "md" }) {
	const interactive = Boolean(onChange);
	const icon = size === "sm" ? "size-3.5" : "size-5";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-0.5",
		role: interactive ? "radiogroup" : "img",
		"aria-label": "Rating",
		children: [
			1,
			2,
			3,
			4,
			5
		].map((n) => {
			const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn(icon, (value ?? 0) >= n ? "fill-primary text-primary" : "text-subtle") });
			if (!interactive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inner }, n);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-9 items-center justify-center rounded-md hover:bg-secondary",
				onClick: () => onChange?.(value === n ? null : n),
				"aria-label": `${n} stele`,
				"aria-pressed": value === n,
				children: inner
			}, n);
		})
	});
}
//#endregion
export { StarRating as t };
