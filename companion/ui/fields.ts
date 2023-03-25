import { settingsStorage } from "settings"
import { NewTokenFieldNameValues } from "./NewTokenFieldName"

/**
 * Retrieve the value of a text field based on its settingsStorage binding.
 *
 * @param settings - SettingsStorage
 * @param settingsKey - Key used for lookup inside settings
 * @returns The value of the text field as a string or the empty string if there is none
 *
 * See https://community.fitbit.com/t5/SDK-Development/TextInput-storing-JSON-string/m-p/2255929#M977 for further details regarding how TextFields are serialized.
 */
export function getTextFieldValueFromSettings(settingsKey: string) {
  const jsonValue = settingsStorage.getItem(settingsKey)
  if (jsonValue) {
    const parsedValue: unknown = JSON.parse(jsonValue)
    if (parsedValue instanceof Object && "name" in parsedValue) {
      return String(parsedValue.name)
    }
  }
  return ""
}

export function getSingleSelectValueFromSettings(settingsKey: string) {
  const jsonValue = settingsStorage.getItem(settingsKey)
  if (jsonValue) {
    const parsedSetting: unknown = JSON.parse(jsonValue)
    if (
      parsedSetting instanceof Object &&
      "values" in parsedSetting &&
      Array.isArray(parsedSetting.values) &&
      parsedSetting.values.length === 1
    ) {
      const selectedValue: unknown = parsedSetting.values[0]
      if (selectedValue instanceof Object && "name" in selectedValue) {
        return String(selectedValue.name)
      }
    }
  }
  return ""
}

export function clearAddTokenManuallyFieldsViaSettings() {
  NewTokenFieldNameValues.forEach(fieldName =>
    settingsStorage.setItem(fieldName, "")
  )
}
