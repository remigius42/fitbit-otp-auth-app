import { settingsStorage } from "settings"
import { UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "../settings/ui"
import {
  addTokenFromQrTag,
  addTokenManually,
  TotpConfig,
  updateDisplayName,
  validateNewManualToken
} from "./tokens"
import { clearAddTokenManuallyFieldsViaSettings } from "./ui/fields"
import { NewTokenButton } from "./ui/NewTokenButton"
import { NewTokenFieldNameValues } from "./ui/NewTokenFieldName"
import {
  clearAllValidationMessages,
  clearAllValidationMessagesForManualTokens
} from "./ui/validation"

export async function initialize() {
  clearAllValidationMessages()
  /* Process the QR tag image if one is set. This is possible if the companion
   * app had been unloaded before an image was selected and the resulting
   * settings changes triggered the companion start. */
  if (settingsStorage.getItem(NewTokenButton.addTokenViaQrTag)) {
    await addTokenFromImage()
  }
  addSettingsChangeListener()
}

function addSettingsChangeListener() {
  settingsStorage.addEventListener("change", ({ key, newValue }) => {
    if (key === UPDATE_DISPLAY_NAME_SETTINGS_KEY) {
      const update = JSON.parse(newValue) as {
        token: TotpConfig
        value: { name: string }
      }
      updateDisplayName(update.token, update.value.name)
    } else if (
      NewTokenFieldNameValues.map(name => String(name)).indexOf(key) !== -1
    ) {
      validateNewManualToken(
        NewTokenFieldNameValues.find(fieldName => String(fieldName) === key)
      )
    } else if (key === NewTokenButton.addTokenViaQrTag) {
      void addTokenFromImage()
    } else if (key === NewTokenButton.addTokenManually) {
      addTokenManually()
    } else if (key === NewTokenButton.reset) {
      clearAddTokenManuallyFieldsViaSettings()
      clearAllValidationMessagesForManualTokens()
    }
  })
}

function addTokenFromImage() {
  const pickedImage = settingsStorage.getItem(NewTokenButton.addTokenViaQrTag)
  const { imageUri } = JSON.parse(pickedImage) as { imageUri: string }
  return addTokenFromQrTag(imageUri)
}
