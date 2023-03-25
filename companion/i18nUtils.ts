import { gettext } from "i18n"

export function gettextWithReplacement(
  msgid: string,
  reference: string,
  replacement: string
) {
  return gettext(msgid).replace(new RegExp(reference, "g"), replacement)
}
