import { NewTokenButton } from "../companion/ui/NewTokenButton"
import { NewTokenFieldName } from "../companion/ui/NewTokenFieldName"

export const UPDATE_DISPLAY_NAME_SETTINGS_KEY = "updateDisplayName"

interface Licenses {
  [key: string]: { version: string; copyright: string }
}

/**
 * Get settings key for the validation message corresponding to the given field
 * name.
 *
 * Note that this function is deliberately not put into the `/companion` folder
 * like the other settings / companion functionality, but instead is kept in
 * `/settings`. This is a workaround to ensure that the call chains starting in
 * `/settings` don't end up in a ES6 module which imports `"settings"`, which
 * would break the build since (ironically) `"settings"` is not available from
 * within `/settings`.
 */
export function getValidationMessageSetting(
  componentName: NewTokenFieldName | NewTokenButton
) {
  return componentName + "Error"
}

export function getVersion(licenses: Licenses) {
  return getOwnLicenseEntry(licenses).version
}

export function thirdPartyLicenseKeys(licenses: Licenses) {
  return Object.keys(licenses).filter(
    key => !key.match(/^fitbit-otp-auth-app@/)
  )
}

function getOwnLicenseEntry(licenses: Licenses) {
  return licenses[
    Object.keys(licenses).filter(key => key.match(/^fitbit-otp-auth-app@/))[0]
  ]
}
