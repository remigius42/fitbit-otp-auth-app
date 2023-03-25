import { settingsStorage } from "settings"
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

export function clearValidationForAllFields() {
  NewTokenFieldNameValues.forEach(fieldName =>
    settingsStorage.removeItem(getValidationMessageSetting(fieldName))
  )
}

export function getValidationMessageSetting(fieldName: NewTokenFieldName) {
  return fieldName + "Error"
}
