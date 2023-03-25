import { settingsStorage } from "settings"
import type { TotpConfig } from "../common/TotpConfig"
import { UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "../settings/ui"
import {
  sendSettingsWhenDeviceIsReady,
  sendTokensToDevice,
  sendTokensWhenDeviceIsReady,
  updateSettings
} from "./peerMessaging"
import { fallbackToDefaultSettings } from "./settings"
import {
  addTokenFromQrTag,
  addTokenManually,
  TOKENS_SETTINGS_KEY,
  updateDisplayName,
  validateNewManualToken
} from "./tokens"
import { clearAddTokenManuallyFieldsViaSettings } from "./ui/fields"
import { NewTokenButton } from "./ui/NewTokenButton"
import { NewTokenFieldNameValues } from "./ui/NewTokenFieldName"
import { SettingsButton } from "./ui/SettingsButton"
import {
  clearAllValidationMessages,
  clearAllValidationMessagesForManualTokens
} from "./ui/validation"

export async function initialize() {
  fallbackToDefaultSettings()
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
    } else if (key === NewTokenButton.reset) {
      clearAddTokenManuallyFieldsViaSettings()
      clearAllValidationMessagesForManualTokens()
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
