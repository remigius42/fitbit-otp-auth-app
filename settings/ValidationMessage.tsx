import { getValidationMessageSetting } from "./ui"

export default function ValidationMessage({ settingsStorage, componentName }) {
  return settingsStorage.getItem(getValidationMessageSetting(componentName)) ? (
    <Text bold>
      {settingsStorage.getItem(getValidationMessageSetting(componentName))}
    </Text>
  ) : null
}
