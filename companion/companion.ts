import { settingsStorage } from "settings"
import { NewTokenFieldNameValues } from "./ui/NewTokenFieldName"
import { clearValidationForAllFields } from "./ui/validation"
import { clearAddTokenManuallyFieldsViaSettings } from "./ui/fields"
import { addToken, validateNewToken } from "./tokens"
import { NewTokenButton } from "./ui/NewTokenButton"

export function initialize() {
  clearValidationForAllFields()
  addSettingsChangeListener()
}

function addSettingsChangeListener() {
  settingsStorage.addEventListener("change", ({ key }) => {
    if (NewTokenFieldNameValues.map(name => String(name)).indexOf(key) !== -1) {
      validateNewToken(
        NewTokenFieldNameValues.find(fieldName => String(fieldName) === key)
      )
    } else if (key === NewTokenButton.addToken) {
      addToken()
    } else if (key === NewTokenButton.reset) {
      clearAddTokenManuallyFieldsViaSettings()
      clearValidationForAllFields()
    }
  })
}
