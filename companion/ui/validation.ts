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
  clearValidationForAllFields()
  settingsStorage.removeItem(
    getValidationMessageSetting(NewTokenButton.addToken)
  )
}

export function clearValidationForAllFields() {
  NewTokenFieldNameValues.forEach(fieldName =>
    settingsStorage.removeItem(getValidationMessageSetting(fieldName))
  )
}
