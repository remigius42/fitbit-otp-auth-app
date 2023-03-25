import { settingsStorage } from "settings"
import { getValidationMessageSetting } from "../../settings/ui"
import { NewTokenButton } from "./NewTokenButton"
import { NewTokenFieldName, NewTokenFieldNameValues } from "./NewTokenFieldName"

export function updateValidationForField(
  validationErrors: Map<NewTokenFieldName, string>,
  fieldName: NewTokenFieldName
) {
  if (validationErrors.has(fieldName)) {
    settingsStorage.setItem(
      getValidationMessageSetting(fieldName),
      validationErrors.get(fieldName)
    )
  } else {
    settingsStorage.removeItem(getValidationMessageSetting(fieldName))
  }
}

export function clearAllValidationMessages() {
  settingsStorage.removeItem(
    getValidationMessageSetting(NewTokenButton.addTokenViaQrTag)
  )
  clearAllValidationMessagesForManualTokens()
}

export function clearAllValidationMessagesForManualTokens() {
  clearValidationForAllFields()
  settingsStorage.removeItem(
    getValidationMessageSetting(NewTokenButton.addTokenManually)
  )
}

export function clearValidationForAllFields() {
  NewTokenFieldNameValues.forEach(fieldName =>
    settingsStorage.removeItem(getValidationMessageSetting(fieldName))
  )
}
