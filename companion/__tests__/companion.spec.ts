import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { i18nMockFactory } from "../__mocks__/i18n"
jest.doMock("i18n", i18nMockFactory, { virtual: true })

import * as settings from "settings"
import { initialize } from "../companion"
import * as tokens from "../tokens"
import * as fields from "../ui/fields"
import { NewTokenButton } from "../ui/NewTokenButton"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../ui/NewTokenFieldName"
import * as validation from "../ui/validation"

describe("companion", () => {
  beforeEach(jest.clearAllMocks)

  describe("initialize", () => {
    const SOME_STRINGIFIED_JSON = '"some stringified JSON"'

    it("calls function to clear all validation messages", () => {
      const clearValidationForAllFieldsSpy = jest.spyOn(
        validation,
        "clearValidationForAllFields"
      )

      initialize()

      expect(clearValidationForAllFieldsSpy).toBeCalled()
      clearValidationForAllFieldsSpy.mockRestore()
    })

    it("adds a settings change listener", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      initialize()

      expect(settingsStorageMock.addEventListener).toBeCalledWith(
        "change",
        expect.anything()
      )
    })

    describe("adds settings change listener which", () => {
      it.each(NewTokenFieldNameValues)(
        "triggers the validation if new token field %s changes",
        (fieldName: NewTokenFieldName) => {
          const settingsStorageMock = setupSettingsStorageMock(fieldName)
          const validateNewTokenSpy = jest.spyOn(tokens, "validateNewToken")
          initialize()

          settingsStorageMock.setItem(fieldName, SOME_STRINGIFIED_JSON)

          expect(validateNewTokenSpy).toBeCalledWith(fieldName)
          validateNewTokenSpy.mockRestore()
        }
      )

      it("invokes addToken function if the add token button is clicked", () => {
        const settingsStorageMock = setupSettingsStorageMock(
          NewTokenButton.addToken
        )
        const addTokenSpy = jest.spyOn(tokens, "addToken")
        initialize()

        settingsStorageMock.setItem(
          NewTokenButton.addToken,
          SOME_STRINGIFIED_JSON
        )

        expect(addTokenSpy).toBeCalled()
        addTokenSpy.mockRestore()
      })

      it("resets the new token fields and validation messages if the reset button is clicked", () => {
        const settingsStorageMock = setupSettingsStorageMock(
          NewTokenButton.reset
        )
        const clearValidationsSpy = jest.spyOn(
          validation,
          "clearValidationForAllFields"
        )
        const clearFieldsSpy = jest.spyOn(
          fields,
          "clearAddTokenManuallyFieldsViaSettings"
        )
        initialize()

        settingsStorageMock.setItem(NewTokenButton.reset, SOME_STRINGIFIED_JSON)

        expect(clearValidationsSpy).toBeCalled()
        expect(clearFieldsSpy).toBeCalled()
        clearValidationsSpy.mockRestore()
        clearFieldsSpy.mockRestore()
      })

      function setupSettingsStorageMock(eventKey: string) {
        const settingsStorageMock = jest.mocked(settings).settingsStorage

        const changeEvent: StorageChangeEvent = {
          key: eventKey,
          defaultPrevented: false,
          newValue: '"some new value JSON"',
          oldValue: '"some old value JSON"',
          target: undefined,
          type: "some type",
          preventDefault: undefined,
          stopImmediatePropagation: undefined,
          stopPropagation: undefined
        }
        settingsStorageMock.addEventListener.mockImplementation(
          (_: string, handler: (event: StorageChangeEvent) => void) => {
            settingsStorageMock.setItem.mockImplementation((key: string) => {
              if (key === eventKey) {
                handler(changeEvent)
              }
            })
          }
        )
        return settingsStorageMock
      }
    })
  })
})
