/* spellchecker:ignore msgid MJUXILTMPEXTEWRWMNFEITY */

import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { i18nMockFactory } from "../__mocks__/i18n"
jest.doMock("i18n", i18nMockFactory, { virtual: true })

import * as settings from "settings"
import { addToken, validateNewToken } from "../tokens"
import * as fields from "../ui/fields"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../ui/NewTokenFieldName"
import * as validation from "../ui/validation"

describe("tokens", () => {
  beforeEach(jest.clearAllMocks)

  describe("addToken", () => {
    it.todo("should add the token if its configuration is valid and new")

    it.todo(
      "should not add the token if its configuration valid but already present"
    )

    it.todo("should not add the token if its configuration is invalid")

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
