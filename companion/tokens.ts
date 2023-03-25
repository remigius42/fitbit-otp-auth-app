/* spell-checker:ignore nuintun qrcode */

import { Decoder } from "@nuintun/qrcode"
import base32decode from "base32-decode"
import { gettext } from "i18n"
import { settingsStorage } from "settings"
import { getDisplayName } from "../common/formatTokens"
import type { TotpConfig } from "../common/TotpConfig"
import { getValidationMessageSetting } from "../settings/ui"
import { gettextWithReplacement } from "./i18nUtils"
import { totpConfigFromUri } from "./keyUri"
import {
  clearAddTokenManuallyFieldsViaSettings,
  getSingleSelectValueFromSettings,
  getTextFieldValueFromSettings
} from "./ui/fields"
import { NewTokenButton } from "./ui/NewTokenButton"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "./ui/NewTokenFieldName"
import { TOKENS_SETTINGS_KEY } from "./ui/settingsKeys"
import {
  clearAllValidationMessages,
  updateValidationForField
} from "./ui/validation"

type TotpConfigInput = Omit<TotpConfig, "displayName">

export async function addTokenFromQrTag(imageUri: string) {
  settingsStorage.removeItem(
    getValidationMessageSetting(NewTokenButton.addTokenViaQrTag)
  )
  const qrcode = new Decoder().setOptions({ canOverwriteImage: true })
  try {
    const { data: otpUri } = await qrcode.scan(imageUri)
    const tokenConfig = totpConfigFromUri(otpUri)
    const validationErrors = validateConfig(tokenConfig)
    if (validationErrors.size === 0) {
      const matchingExistingToken = getMatchingExistingToken(tokenConfig)
      if (!matchingExistingToken) {
        addTokenToSettings(tokenConfig)
      } else {
        settingsStorage.setItem(
          getValidationMessageSetting(NewTokenButton.addTokenViaQrTag),
          getErrorMessageForDuplicateToken(matchingExistingToken)
        )
      }
    } else {
      settingsStorage.setItem(
        getValidationMessageSetting(NewTokenButton.addTokenViaQrTag),
        Array.from(validationErrors.values()).join(", ")
      )
    }
  } catch {
    settingsStorage.setItem(
      getValidationMessageSetting(NewTokenButton.addTokenViaQrTag),
      gettext("Error: Could not decode QR tag")
    )
  } finally {
    settingsStorage.removeItem(NewTokenButton.addTokenViaQrTag)
  }
}

export function addTokenManually() {
  const { tokenConfig, validationErrors } = validateNewManualToken()

  if (validationErrors.size === 0) {
    const matchingExistingToken = getMatchingExistingToken(tokenConfig)
    if (!matchingExistingToken) {
      clearAddTokenManuallyFieldsViaSettings()
      clearAllValidationMessages()
      addTokenToSettings(tokenConfig)
    } else {
      settingsStorage.setItem(
        getValidationMessageSetting(NewTokenButton.addTokenManually),
        getErrorMessageForDuplicateToken(matchingExistingToken)
      )
    }
  }
}

export function validateNewManualToken(fieldName?: NewTokenFieldName) {
  const tokenConfig = mapTokenFieldsToTotpConfig()
  const validationErrors = validateConfig(tokenConfig)
  if (fieldName) {
    updateValidationForField(validationErrors, fieldName)
  } else {
    NewTokenFieldNameValues.forEach(fieldName => {
      updateValidationForField(validationErrors, fieldName)
    })
  }

  return { tokenConfig, validationErrors }
}

const isConsideredSameToken = (tokenA: TotpConfig, tokenB: TotpConfig) =>
  tokenA.label === tokenB.label && tokenA.issuer === tokenB.issuer

export function getMatchingExistingToken(newTokenConfig: TotpConfig) {
  const tokens = getTokensFromSettings()

  return tokens.find(token => isConsideredSameToken(token, newTokenConfig))
}

export function addTokenToSettings(tokenConfig: TotpConfig) {
  const tokens = getTokensFromSettings()
  tokens.push(tokenConfig)
  settingsStorage.setItem(TOKENS_SETTINGS_KEY, JSON.stringify(tokens))
}

export function getErrorMessageForDuplicateToken(
  matchingExistingToken: TotpConfig
) {
  const tokens = getTokensFromSettings()
  const tokenIndex = tokens.findIndex(token =>
    isConsideredSameToken(token, matchingExistingToken)
  )
  const conflictingToken = tokens[tokenIndex]
  return gettextWithReplacement(
    "Error: Token with same label and issuer already exists",
    "@token_list_reference",
    `#${tokenIndex + 1}: ${getDisplayName(conflictingToken, true)}`
  )
}

export function updateDisplayName(
  targetToken: TotpConfig,
  displayName: string
) {
  const tokens = getTokensFromSettings()
  const token = tokens.find(token => isConsideredSameToken(token, targetToken))
  const displayNameDiffersFromDefault = (
    token: TotpConfig,
    displayName: string
  ) => displayName !== getDisplayName({ ...token, displayName: undefined })

  if (token) {
    if (displayNameDiffersFromDefault(token, displayName)) {
      token.displayName = displayName
    } else {
      token.displayName = undefined
    }
    settingsStorage.setItem(TOKENS_SETTINGS_KEY, JSON.stringify(tokens))
  }
}

function getTokensFromSettings() {
  const tokensSetting = settingsStorage.getItem(TOKENS_SETTINGS_KEY)
  const parsedTokenSetting: Array<TotpConfig> = tokensSetting
    ? (JSON.parse(tokensSetting) as Array<TotpConfig>)
    : []
  return parsedTokenSetting
}

function mapTokenFieldsToTotpConfig() {
  const config: TotpConfigInput = {
    label: getTextFieldValueFromSettings(NewTokenFieldName.label),
    issuer: getTextFieldValueFromSettings(NewTokenFieldName.issuer),
    secret: getTextFieldValueFromSettings(NewTokenFieldName.secret),
    algorithm: getSingleSelectValueFromSettings(NewTokenFieldName.algorithm),
    digits: getSingleSelectValueFromSettings(NewTokenFieldName.digits),
    period: getTextFieldValueFromSettings(NewTokenFieldName.period)
  }
  return config
}

function validateConfig(config: TotpConfigInput) {
  const validationErrors = new Map<NewTokenFieldName, string>()

  if (!config.label) {
    validationErrors.set(
      NewTokenFieldName.label,
      gettext("Error: Label must not be empty")
    )
  } else {
    const optionalIssuerLabelPrefix = config.label.match(/^([^:]+):/)?.[1]
    if (
      optionalIssuerLabelPrefix &&
      config.issuer &&
      config.issuer !== optionalIssuerLabelPrefix
    ) {
      validationErrors.set(
        NewTokenFieldName.issuer,
        gettextWithReplacement(
          "Error: Issuer should match label issuer prefix",
          "@issuer_prefix",
          optionalIssuerLabelPrefix
        )
      )
    }
  }
  if (!config.algorithm) {
    validationErrors.set(
      NewTokenFieldName.algorithm,
      gettext("Error: Algorithm must be selected")
    )
  }
  if (!config.secret) {
    validationErrors.set(
      NewTokenFieldName.secret,
      gettext("Error: Secret must not be empty")
    )
  } else {
    try {
      base32decode(config.secret.toUpperCase(), "RFC4648")
    } catch (error) {
      validationErrors.set(
        NewTokenFieldName.secret,
        gettext("Error: Secret cannot be decoded")
      )
    }
  }
  if (!config.digits) {
    validationErrors.set(
      NewTokenFieldName.digits,
      gettext("Error: Number of digits must be selected")
    )
  }
  if (!config.period) {
    validationErrors.set(
      NewTokenFieldName.period,
      gettext("Error: Period must not be empty")
    )
  } else if (
    !Number.parseInt(config.period, 10) ||
    !Number.isInteger(Number.parseFloat(config.period)) ||
    Number.parseInt(config.period, 10) <= 0
  ) {
    validationErrors.set(
      NewTokenFieldName.period,
      gettext("Error: Period must be a whole number greater 0")
    )
  }
  return validationErrors
}
