import { settingsStorage } from "settings"
import { ColorSchemeName } from "../common/ColorSchemes"
import type { TotpConfig } from "../common/TotpConfig"
import { UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "../settings/ui"
import {
  monitorConnectionState,
  sendSettingsWhenDeviceIsReady,
  sendTokensToDevice,
  sendTokensWhenDeviceIsReady,
  updateSettings
} from "./peerMessaging"
import {
  fallbackToDefaultSettings,
  setDefaultValuesForManualTokenEntry
} from "./settings"
import {
  addTokenFromQrTag,
  addTokenManually,
  updateDisplayName,
  validateNewManualToken
} from "./tokens"
import { clearAddTokenManuallyFieldsViaSettings } from "./ui/fields"
import { NewTokenButton } from "./ui/NewTokenButton"
import { NewTokenFieldNameValues } from "./ui/NewTokenFieldName"
import { SettingsButton } from "./ui/SettingsButton"
import { TOKENS_SETTINGS_KEY } from "./ui/settingsKeys"
import {
  clearAllValidationMessages,
  clearAllValidationMessagesForManualTokens
} from "./ui/validation"

export async function initialize() {
  fallbackToDefaultSettings()
  setDefaultValuesForManualTokenEntry()
  clearAllValidationMessages()
  /* Process the QR tag image if one is set. This is possible if the companion
   * app had been unloaded before an image was selected and the resulting
   * settings changes triggered the companion start. */
  if (settingsStorage.getItem(NewTokenButton.addTokenViaQrTag)) {
    await addTokenFromImage()
  }
  addSettingsChangeListener()
  sendTokensWhenDeviceIsReady()
  sendSettingsWhenDeviceIsReady()
  monitorConnectionState()
}

function addSettingsChangeListener() {
  settingsStorage.addEventListener("change", ({ key, newValue }) => {
    if (key === UPDATE_DISPLAY_NAME_SETTINGS_KEY) {
      const update = JSON.parse(newValue) as {
        token: TotpConfig
        value: { name: string }
      }
      updateDisplayName(update.token, update.value.name)
      sendCurrentTokensToDevice()
    } else if (
      NewTokenFieldNameValues.map(name => String(name)).indexOf(key) !== -1
    ) {
      validateNewManualToken(
        NewTokenFieldNameValues.find(fieldName => String(fieldName) === key)
      )
    } else if (key === NewTokenButton.addTokenViaQrTag) {
      void addTokenFromImage().then(sendCurrentTokensToDevice)
    } else if (key === NewTokenButton.addTokenManually) {
      addTokenManually()
      sendCurrentTokensToDevice()
      setDefaultValuesForManualTokenEntry()
    } else if (key === NewTokenButton.resetToDefaults) {
      clearAddTokenManuallyFieldsViaSettings()
      clearAllValidationMessagesForManualTokens()
      setDefaultValuesForManualTokenEntry()
    } else if (key === TOKENS_SETTINGS_KEY) {
      const tokens = JSON.parse(newValue) as Array<TotpConfig>
      sendTokensToDevice(tokens)
    } else if (key === SettingsButton.compensateClockDrift) {
      sendCurrentTokensToDevice()
    } else if (key === SettingsButton.storeTokensOnDevice) {
      sendCurrentTokensToDevice()
    } else if (key === SettingsButton.showEnlargedTokensView) {
      updateSettings({
        shouldUseLargeTokenView: JSON.parse(newValue) as boolean
      })
    } else if (key === SettingsButton.colorScheme) {
      updateSettings({ colorScheme: JSON.parse(newValue) as ColorSchemeName })
    }
  })
}

function addTokenFromImage() {
  const pickedImage = settingsStorage.getItem(NewTokenButton.addTokenViaQrTag)
  const { imageUri } = JSON.parse(pickedImage) as { imageUri: string }
  return addTokenFromQrTag(imageUri)
}

function sendCurrentTokensToDevice() {
  const currentTokens = settingsStorage.getItem(TOKENS_SETTINGS_KEY)
  if (currentTokens) {
    const tokens = JSON.parse(currentTokens) as Array<TotpConfig>
    sendTokensToDevice(tokens)
  }
}
