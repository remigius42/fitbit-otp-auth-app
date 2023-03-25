import { settingsStorage } from "settings"
import { UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "../settings/ui"
import {
  addToken,
  TotpConfig,
  updateDisplayName,
  validateNewToken
} from "./tokens"
import { clearAddTokenManuallyFieldsViaSettings } from "./ui/fields"
import { NewTokenButton } from "./ui/NewTokenButton"
import { NewTokenFieldNameValues } from "./ui/NewTokenFieldName"
import { clearAllValidationMessages } from "./ui/validation"

export function initialize() {
  clearAllValidationMessages()
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
      validateNewToken(
        NewTokenFieldNameValues.find(fieldName => String(fieldName) === key)
      )
    } else if (key === NewTokenButton.addToken) {
      addToken()
    } else if (key === NewTokenButton.reset) {
      clearAddTokenManuallyFieldsViaSettings()
      clearAllValidationMessages()
    }
  })
}
