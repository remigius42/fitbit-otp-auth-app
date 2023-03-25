import { settingsStorage } from "settings"
import { HAS_CONNECTION_ISSUE_SETTINGS_KEY } from "./settingsKeys"

export function signalConnected() {
  settingsStorage.removeItem(HAS_CONNECTION_ISSUE_SETTINGS_KEY)
}

export function signalDisconnected() {
  settingsStorage.setItem(HAS_CONNECTION_ISSUE_SETTINGS_KEY, "true") // note that the actual value is irrelevant as long as the item is set
}
