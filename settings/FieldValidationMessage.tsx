import { getValidationMessageSetting } from "./ui"

export default function ValidationMessage({ settingsStorage, fieldName }) {
  return settingsStorage.getItem(getValidationMessageSetting(fieldName)) ? (
    <Text bold>
      {settingsStorage.getItem(getValidationMessageSetting(fieldName))}
    </Text>
  ) : null
}
