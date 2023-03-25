import { gettext } from "i18n"
import base32decode from "base32-decode"
import {
  clearAddTokenManuallyFieldsViaSettings,
  getSingleSelectValueFromSettings,
  getTextFieldValueFromSettings
} from "./ui/fields"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "./ui/NewTokenFieldName"
import { updateValidationForField } from "./ui/validation"

export function addToken() {
  const { tokenConfig, validationErrors } = validateNewToken()

  if (validationErrors.size === 0) {
    clearAddTokenManuallyFieldsViaSettings()
    // TODO: store new token based on tokenConfig
    console.log("adding token config:", tokenConfig) // eslint-disable-line
  }
}

export function validateNewToken(fieldName?: NewTokenFieldName) {
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
        gettext("Error: Issuer should match label issuer prefix").replace(
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

interface TotpConfigInput {
  label: string
  issuer?: string
  secret: string
  algorithm: string
  digits: string
  period: string
}
