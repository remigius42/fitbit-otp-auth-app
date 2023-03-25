import { NewTokenFieldName } from "../companion/ui/NewTokenFieldName"
import type { TotpConfig } from "../companion/tokens"
import { NewTokenButton } from "../companion/ui/NewTokenButton"

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

/**
 * Get the display name for a token configuration and optionally include the
 * label and the issuer as well, even if a custom display name is defined.
 *
 * The reason why this helper function is within `/settings` and not within the
 * `/companion` folder is the same as for {@link getValidationMessageSetting}.
 */
export function getDisplayName(
  { label, issuer, displayName }: TotpConfig,
  includeLabelAndIssuer = false
) {
  const formatLabelAndIssuer = (label: string, issuer: string) =>
    issuer ? `${issuer} (${label})` : label

  if (displayName) {
    if (includeLabelAndIssuer) {
      return `${displayName} / ${formatLabelAndIssuer(label, issuer)}`
    } else {
      return displayName
    }
  } else {
    return formatLabelAndIssuer(label, issuer)
  }
}

export function getVersion(licenses: Licenses) {
  return getOwnLicenseEntry(licenses).version
}

export function getCopyright(licenses: Licenses) {
  return getOwnLicenseEntry(licenses).copyright
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
