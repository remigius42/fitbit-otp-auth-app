import { settingsStorage } from "settings"
import { SettingsButton } from "./ui/SettingsButton"

/**
 * Fallback to the default settings if some configuration is missing.
 *
 * This should only happen when the application is started for the first time.
 */
export function fallbackToDefaultSettings() {
  if (settingsStorage.getItem(SettingsButton.compensateClockDrift) === null) {
    settingsStorage.setItem(SettingsButton.compensateClockDrift, "true")
  }
  if (settingsStorage.getItem(SettingsButton.storeTokensOnDevice) === null) {
    settingsStorage.setItem(SettingsButton.storeTokensOnDevice, "false")
  }
  if (settingsStorage.getItem(SettingsButton.showEnlargedTokensView) === null) {
    settingsStorage.setItem(SettingsButton.showEnlargedTokensView, "false")
  }
}

export function isCompensatingClockDrift() {
  return (
    JSON.parse(settingsStorage.getItem(SettingsButton.compensateClockDrift)) ===
    true
  )
}

export function isStoringTokensOnDevice() {
  return (
    JSON.parse(settingsStorage.getItem(SettingsButton.storeTokensOnDevice)) ===
    true
  )
}
