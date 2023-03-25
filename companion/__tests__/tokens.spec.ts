/* spellchecker:ignore msgid MJUXILTMPEXTEWRWMNFEITY */

import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { i18nMockFactory } from "../__mocks__/i18n"
jest.doMock("i18n", i18nMockFactory, { virtual: true })

import * as settings from "settings"
import { getDisplayName, getValidationMessageSetting } from "../../settings/ui"
import * as i18nUtils from "../i18nUtils"
import {
  addToken,
  addTokenToSettings,
  getErrorMessageForDuplicateToken,
  getMatchingExistingToken,
  TOKENS_SETTINGS_KEY,
  TotpConfig,
  updateDisplayName,
  validateNewToken
} from "../tokens"
import * as fields from "../ui/fields"
import { NewTokenButton } from "../ui/NewTokenButton"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../ui/NewTokenFieldName"
import * as validation from "../ui/validation"

describe("tokens", () => {
  beforeEach(jest.clearAllMocks)

  const NEW_TOKEN_LABEL = "some label"
  const NEW_TOKEN_ISSUER = "some issuer"

  const SOME_TOTP_CONFIG_WITHOUT_ISSUER: TotpConfig = {
    label: "some label",
    secret: "some secret",
    algorithm: "some algorithm",
    digits: "some digits",
    period: "some period"
  }

  const SOME_TOTP_CONFIG_WITH_ISSUER = {
    ...SOME_TOTP_CONFIG_WITHOUT_ISSUER,
    issuer: "some issuer"
  }

  describe("addToken", () => {
    it("should add the token if its configuration is valid and new", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        getItemForValidTokenSettings
      )

      addToken()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        "tokens",
        expect.any(String)
      )
    })

    it("should clear the add token validation message if the token is added", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        getItemForValidTokenSettings
      )

      addToken()

      expect(settingsStorageMock.removeItem).toBeCalledWith(
        getValidationMessageSetting(NewTokenButton.addToken)
      )
    })

    it("should not add the token if its configuration valid but already present", () => {
      const settingsStorageMock = settingsMockWithTokens([
        {
          ...SOME_TOTP_CONFIG_WITH_ISSUER,
          label: NEW_TOKEN_LABEL,
          issuer: NEW_TOKEN_ISSUER
        }
      ])

      addToken()

      expect(settingsStorageMock.setItem).not.toBeCalledWith(
        "tokens",
        expect.any(String)
      )
    })

    it("should show error message if matching token already exists", () => {
      const settingsStorageMock = settingsMockWithTokens([
        {
          ...SOME_TOTP_CONFIG_WITH_ISSUER,
          label: NEW_TOKEN_LABEL,
          issuer: NEW_TOKEN_ISSUER
        }
      ])

      addToken()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        getValidationMessageSetting(NewTokenButton.addToken),
        "Error: Token with same label and issuer already exists"
      )
    })

    it("should show error validation errors if the configuration is invalid", () => {
      const INVALID_PERIOD_SETTING = "-4.3"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(
          NewTokenFieldName.period,
          INVALID_PERIOD_SETTING
        )
      )

      addToken()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        getValidationMessageSetting(NewTokenFieldName.period),
        "Error: Period must be a whole number greater 0"
      )
    })

    it("should not add the token if its configuration is invalid", () => {
      const INVALID_PERIOD_SETTING = "-4.3"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(
          NewTokenFieldName.period,
          INVALID_PERIOD_SETTING
        )
      )

      addToken()

      expect(settingsStorageMock.setItem).not.toBeCalledWith(
        "tokens",
        expect.any(String)
      )
    })

    it("should invoke function to clear the token fields if the new token configuration is valid", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        getItemForValidTokenSettings
      )
      const clearAddTokenManuallyFieldsViaSettingsSpy = jest.spyOn(
        fields,
        "clearAddTokenManuallyFieldsViaSettings"
      )

      addToken()

      expect(clearAddTokenManuallyFieldsViaSettingsSpy).toBeCalled()
      clearAddTokenManuallyFieldsViaSettingsSpy.mockRestore()
    })

    it("should not invoke function to clear the token fields if the new token configuration is invalid", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      const clearAddTokenManuallyFieldsViaSettingsSpy = jest.spyOn(
        fields,
        "clearAddTokenManuallyFieldsViaSettings"
      )
      const INVALID_PERIOD_SETTING = "-4.3"
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(
          NewTokenFieldName.period,
          INVALID_PERIOD_SETTING
        )
      )

      addToken()

      expect(clearAddTokenManuallyFieldsViaSettingsSpy).not.toBeCalled()
      clearAddTokenManuallyFieldsViaSettingsSpy.mockRestore()
    })
  })

  describe("validateNewToken", () => {
    it.each(NewTokenFieldNameValues)(
      "should update the validation of the given field name for %s",
      (fieldName: NewTokenFieldName) => {
        const settingsStorageMock = jest.mocked(settings).settingsStorage
        const updateValidationForFieldSpy = jest.spyOn(
          validation,
          "updateValidationForField"
        )
        const INVALID_EMPTY_STRING = ""
        settingsStorageMock.getItem.mockImplementation(
          patchGetItemForValidTokenSettings(fieldName, INVALID_EMPTY_STRING)
        )

        validateNewToken(fieldName)

        expect(updateValidationForFieldSpy).toBeCalledWith(
          expect.any(Map<NewTokenFieldName, string>),
          fieldName
        )
        updateValidationForFieldSpy.mockRestore()
      }
    )

    it.each(NewTokenFieldNameValues)(
      "should not update the validation of other fields except the given field name for %s",
      (testFieldName: NewTokenFieldName) => {
        const settingsStorageMock = jest.mocked(settings).settingsStorage
        const updateValidationForFieldSpy = jest.spyOn(
          validation,
          "updateValidationForField"
        )
        const INVALID_EMPTY_STRING = ""
        settingsStorageMock.getItem.mockImplementation(
          patchGetItemForValidTokenSettings(testFieldName, INVALID_EMPTY_STRING)
        )

        validateNewToken(testFieldName)

        NewTokenFieldNameValues.filter(
          fieldName => fieldName !== testFieldName
        ).forEach(fieldName =>
          expect(updateValidationForFieldSpy).not.toBeCalledWith(
            expect.any(Map<NewTokenFieldName, string>),
            fieldName
          )
        )
        updateValidationForFieldSpy.mockRestore()
      }
    )

    it("should update the validation of all relevant fields if no field name is given", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      const updateValidationForFieldSpy = jest.spyOn(
        validation,
        "updateValidationForField"
      )
      const INVALID_EMPTY_STRING = ""
      settingsStorageMock.getItem.mockImplementation(
        jest.fn(() => INVALID_EMPTY_STRING)
      )

      validateNewToken()

      NewTokenFieldNameValues.forEach(fieldName =>
        expect(updateValidationForFieldSpy).toBeCalledWith(
          expect.any(Map<NewTokenFieldName, string>),
          fieldName
        )
      )
      updateValidationForFieldSpy.mockRestore()
    })

    it.each([
      {
        testFieldName: NewTokenFieldName.label,
        msgid: "Error: Label must not be empty"
      },
      {
        testFieldName: NewTokenFieldName.secret,
        msgid: "Error: Secret must not be empty"
      },
      {
        testFieldName: NewTokenFieldName.algorithm,
        msgid: "Error: Algorithm must be selected"
      },
      {
        testFieldName: NewTokenFieldName.digits,
        msgid: "Error: Number of digits must be selected"
      },
      {
        testFieldName: NewTokenFieldName.period,
        msgid: "Error: Period must not be empty"
      }
    ])(
      "should consider an empty $fieldName setting invalid",
      ({ testFieldName, msgid }) => {
        const settingsStorageMock = jest.mocked(settings).settingsStorage
        settingsStorageMock.getItem.mockImplementation(
          patchGetItemForValidTokenSettings(testFieldName, "")
        )

        const { validationErrors } = validateNewToken(NewTokenFieldName.label)

        expect(validationErrors.get(testFieldName)).toBe(msgid)
      }
    )

    // See https://github.com/google/google-authenticator/wiki/Key-Uri-Format#issuer
    it("should consider an issuer not matching the label issuer prefix invalid", () => {
      const SOME_ACCOUNT_NAME = "some account name"
      const SOME_ISSUER = "some issuer"
      const SOME_OTHER_ISSUER = "some other issuer"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        (fieldName: NewTokenFieldName) => {
          if (fieldName === NewTokenFieldName.label) {
            return JSON.stringify({
              name: `${SOME_ISSUER}:${SOME_ACCOUNT_NAME}`
            })
          } else if (fieldName === NewTokenFieldName.issuer) {
            return JSON.stringify({ name: SOME_OTHER_ISSUER })
          } else {
            return getItemForValidTokenSettings(fieldName)
          }
        }
      )

      const { validationErrors } = validateNewToken(NewTokenFieldName.issuer)

      expect(validationErrors.get(NewTokenFieldName.issuer)).toBe(
        "Error: Issuer should match label issuer prefix"
      )
    })

    it("should ignore the casing of the secret", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(
          NewTokenFieldName.secret,
          "mjuxiltmpextewrwmnfeity"
        )
      )

      const { validationErrors } = validateNewToken(NewTokenFieldName.secret)

      expect(validationErrors.get(NewTokenFieldName.secret)).toBeUndefined()
    })

    it("should consider an undecodable secret invalid", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(
          NewTokenFieldName.secret,
          "not a valid base32 string"
        )
      )

      const { validationErrors } = validateNewToken(NewTokenFieldName.secret)

      expect(validationErrors.get(NewTokenFieldName.secret)).toBe(
        "Error: Secret cannot be decoded"
      )
    })

    it("should consider a non-integer period invalid", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(NewTokenFieldName.period, "23.42")
      )

      const { validationErrors } = validateNewToken(NewTokenFieldName.period)

      expect(validationErrors.get(NewTokenFieldName.period)).toBe(
        "Error: Period must be a whole number greater 0"
      )
    })

    it("should consider a period below or equal 0 invalid", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(
        patchGetItemForValidTokenSettings(NewTokenFieldName.period, "-23")
      )

      const { validationErrors } = validateNewToken(NewTokenFieldName.period)

      expect(validationErrors.get(NewTokenFieldName.period)).toBe(
        "Error: Period must be a whole number greater 0"
      )
    })
  })

  describe("getMatchingExistingToken", () => {
    it("should return the existing token of label and issuer match", () => {
      settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])

      const matchingToken = getMatchingExistingToken(
        SOME_TOTP_CONFIG_WITH_ISSUER
      )

      expect(matchingToken).toStrictEqual(SOME_TOTP_CONFIG_WITH_ISSUER)
    })

    it("should return the existing token if both the new token and the match have no issuer", () => {
      settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITH_ISSUER,
        SOME_TOTP_CONFIG_WITHOUT_ISSUER
      ])

      const matchingToken = getMatchingExistingToken(
        SOME_TOTP_CONFIG_WITHOUT_ISSUER
      )

      expect(matchingToken).toStrictEqual(SOME_TOTP_CONFIG_WITHOUT_ISSUER)
    })

    it("should only consider label and issuer to determine a match", () => {
      settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITH_ISSUER,
        SOME_TOTP_CONFIG_WITHOUT_ISSUER
      ])
      const TOKEN_MATCHING_SOME_TOTP_CONFIG_WITH_ISSUER = {
        ...SOME_TOTP_CONFIG_WITH_ISSUER,
        secret: "some different secret",
        algorithm: "some different algorithm",
        digits: "some different digits",
        period: "some different period"
      }

      const matchingToken = getMatchingExistingToken(
        TOKEN_MATCHING_SOME_TOTP_CONFIG_WITH_ISSUER
      )

      expect(matchingToken).toStrictEqual(SOME_TOTP_CONFIG_WITH_ISSUER)
    })
  })

  describe("addTokenToSettings", () => {
    it("should add the token at the end of the token list", () => {
      const INITIAL_TOKENS = [SOME_TOTP_CONFIG_WITH_ISSUER]
      const settingsStorageMock = settingsMockWithTokens(INITIAL_TOKENS)

      addTokenToSettings(SOME_TOTP_CONFIG_WITHOUT_ISSUER)

      expect(settingsStorageMock.setItem).toHaveBeenCalledWith(
        TOKENS_SETTINGS_KEY,
        JSON.stringify([...INITIAL_TOKENS, SOME_TOTP_CONFIG_WITHOUT_ISSUER])
      )
    })
  })

  describe("getErrorMessageForDuplicateToken", () => {
    describe("should invoke gettextWithReplacement with a replacement", () => {
      const SOME_DISPLAY_NAME = "some display name"
      it.each([
        {
          testName: "containing the index of the conflicting token",
          displayName: undefined,
          matchRegex: /^#2: /
        },
        {
          testName: "containing the index of the conflicting token",
          displayName: undefined,
          matchRegex: new RegExp(
            `\\b${SOME_TOTP_CONFIG_WITHOUT_ISSUER.label}\\b`
          )
        },
        {
          testName:
            "containing the label of the conflicting token regardless even if it has a display name",
          displayName: SOME_DISPLAY_NAME,
          matchRegex: new RegExp(
            `\\b${SOME_TOTP_CONFIG_WITHOUT_ISSUER.label}\\b`
          )
        },
        {
          testName:
            "containing the issuer of the conflicting token if it has one",
          displayName: undefined,
          matchRegex: new RegExp(`\\b${SOME_TOTP_CONFIG_WITH_ISSUER.issuer}\\b`)
        },
        {
          testName:
            "containing the issuer of the conflicting token if it has one even it has a display name",
          displayName: SOME_DISPLAY_NAME,
          matchRegex: new RegExp(`\\b${SOME_TOTP_CONFIG_WITH_ISSUER.issuer}\\b`)
        },
        {
          testName:
            "containing the display name of the conflicting token if it has one",
          displayName: SOME_DISPLAY_NAME,
          matchRegex: new RegExp(`\\b${SOME_DISPLAY_NAME}\\b`)
        }
      ])(
        "$testName",
        ({
          displayName,
          matchRegex
        }: {
          displayName?: string
          matchRegex: RegExp
        }) => {
          const gettextWithReplacementSpy = jest.spyOn(
            i18nUtils,
            "gettextWithReplacement"
          )
          settingsMockWithTokens([
            SOME_TOTP_CONFIG_WITHOUT_ISSUER,
            {
              ...SOME_TOTP_CONFIG_WITH_ISSUER,
              displayName
            }
          ])

          getErrorMessageForDuplicateToken(SOME_TOTP_CONFIG_WITH_ISSUER)

          expect(gettextWithReplacementSpy).toBeCalledWith(
            expect.any(String),
            expect.any(String),
            expect.stringMatching(matchRegex)
          )
          gettextWithReplacementSpy.mockRestore()
        }
      )
    })
  })

  describe("updateDisplayName", () => {
    const SOME_DISPLAY_NAME = "some display name"

    it("should update the displayName of the token with matching label and issuer", () => {
      const settingsStorageMock = settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])
      const setItemSpy = jest.spyOn(settingsStorageMock, "setItem")

      updateDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER, SOME_DISPLAY_NAME)

      const expectedSerializedTokens = JSON.stringify([
        { ...SOME_TOTP_CONFIG_WITH_ISSUER, displayName: SOME_DISPLAY_NAME }
      ])
      expect(setItemSpy).toBeCalledWith(
        TOKENS_SETTINGS_KEY,
        expectedSerializedTokens
      )
      setItemSpy.mockRestore()
    })

    it("should update the displayName of the token with matching label if the issuer is missing", () => {
      const settingsStorageMock = settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER
      ])
      const setItemSpy = jest.spyOn(settingsStorageMock, "setItem")

      updateDisplayName(SOME_TOTP_CONFIG_WITHOUT_ISSUER, SOME_DISPLAY_NAME)

      const expectedSerializedTokens = JSON.stringify([
        { ...SOME_TOTP_CONFIG_WITHOUT_ISSUER, displayName: SOME_DISPLAY_NAME }
      ])
      expect(setItemSpy).toBeCalledWith(
        TOKENS_SETTINGS_KEY,
        expectedSerializedTokens
      )
      setItemSpy.mockRestore()
    })

    it("should only update the displayName of the matching token", () => {
      const settingsStorageMock = settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])
      const setItemSpy = jest.spyOn(settingsStorageMock, "setItem")

      updateDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER, SOME_DISPLAY_NAME)

      const expectedSerializedTokens = JSON.stringify([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        { ...SOME_TOTP_CONFIG_WITH_ISSUER, displayName: SOME_DISPLAY_NAME }
      ])
      expect(setItemSpy).toBeCalledWith(
        TOKENS_SETTINGS_KEY,
        expectedSerializedTokens
      )
      setItemSpy.mockRestore()
    })

    it("should not set the displayName if it's identical to the default", () => {
      const settingsStorageMock = settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])
      const DEFAULT_DISPLAY_NAME = getDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER)
      const setItemSpy = jest.spyOn(settingsStorageMock, "setItem")

      updateDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER, DEFAULT_DISPLAY_NAME)

      const expectedSerializedTokens = JSON.stringify([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])
      expect(setItemSpy).toBeCalledWith(
        TOKENS_SETTINGS_KEY,
        expectedSerializedTokens
      )
      setItemSpy.mockRestore()
    })

    it("should remove the displayName if it's set to the default", () => {
      const settingsStorageMock = settingsMockWithTokens([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        { ...SOME_TOTP_CONFIG_WITH_ISSUER, displayName: "some displayName" }
      ])
      const DEFAULT_DISPLAY_NAME = getDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER)
      const setItemSpy = jest.spyOn(settingsStorageMock, "setItem")

      updateDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER, DEFAULT_DISPLAY_NAME)

      const expectedSerializedTokens = JSON.stringify([
        SOME_TOTP_CONFIG_WITHOUT_ISSUER,
        SOME_TOTP_CONFIG_WITH_ISSUER
      ])
      expect(setItemSpy).toBeCalledWith(
        TOKENS_SETTINGS_KEY,
        expectedSerializedTokens
      )
      setItemSpy.mockRestore()
    })
  })

  function getItemForValidTokenSettings(fieldName: string) {
    switch (fieldName) {
      case NewTokenFieldName.label:
        return JSON.stringify({ name: "some label" })
      case NewTokenFieldName.issuer:
        return JSON.stringify({ name: "some issuer" })
      case NewTokenFieldName.secret:
        return JSON.stringify({ name: "MJUXILTMPEXTEWRWMNFEITY" })
      case NewTokenFieldName.algorithm:
        return JSON.stringify({ values: [{ name: "SHA1" }] })
      case NewTokenFieldName.digits:
        return JSON.stringify({ values: [{ name: "6" }] })
      case NewTokenFieldName.period:
        return JSON.stringify({ name: "42" })
      default:
        return ""
    }
  }

  function settingsMockWithTokens(tokens: Array<TotpConfig>) {
    const settingsStorageMock = jest.mocked(settings).settingsStorage

    settingsStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "tokens") {
        return JSON.stringify(tokens)
      } else {
        return getItemForValidTokenSettings(key)
      }
    })
    settingsStorageMock.setItem.mockImplementation()

    return settingsStorageMock
  }

  function patchGetItemForValidTokenSettings(
    patchFieldName: NewTokenFieldName,
    value: string
  ) {
    return jest.fn((fieldName: NewTokenFieldName) => {
      if (fieldName === patchFieldName) {
        return JSON.stringify({ name: value })
      } else {
        return getItemForValidTokenSettings(fieldName)
      }
    })
  }
})
