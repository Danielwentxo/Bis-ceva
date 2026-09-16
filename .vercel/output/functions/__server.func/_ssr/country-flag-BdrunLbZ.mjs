import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cn } from "./format-DrKsHGab.mjs";
import { n as flagUrl } from "./countries-B1SZxW01.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/country-flag-BdrunLbZ.js
var import_jsx_runtime = require_jsx_runtime();
function CountryFlag({ code, className }) {
	if (!code) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: flagUrl(code, 40),
		alt: "",
		className: cn("h-3.5 w-5 rounded-sm object-cover shadow-[var(--shadow-border)]", className)
	});
}
//#endregion
export { CountryFlag as t };
