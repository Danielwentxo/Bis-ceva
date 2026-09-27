import { EAST_DICTS } from "@/lib/i18n-jaar";
import { MORE_DICTS as WEST } from "@/lib/i18n-frdees";
import { NEW_DICTS } from "@/lib/i18n-newlangs";

export const MORE_DICTS: Record<string, Record<string, string>> = {
  ...WEST,
  ...NEW_DICTS,
  ...EAST_DICTS,
};
