import { gettext } from "i18n"
import { HAS_CONNECTION_ISSUE_SETTINGS_KEY } from "../companion/ui/settingsKeys"

export default function ConnectionStatus({ settingsStorage }) {
  return settingsStorage.getItem(HAS_CONNECTION_ISSUE_SETTINGS_KEY) ? (
    <Text italic align="center">
      {gettext("No connection to device message")}
    </Text>
  ) : null
}
