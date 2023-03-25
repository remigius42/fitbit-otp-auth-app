import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { i18nMockFactory } from "../__mocks__/i18n"
jest.doMock("i18n", i18nMockFactory, { virtual: true })

import * as settings from "settings"
import { UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "../../settings/ui"
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
      const clearAllValidationMessagesSpy = jest.spyOn(
        validation,
        "clearAllValidationMessages"
      )

      initialize()

      expect(clearAllValidationMessagesSpy).toBeCalled()
      clearAllValidationMessagesSpy.mockRestore()
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
      it("invokes updateDisplayName if its corresponding setting is updated", () => {
        const SOME_TOKEN: tokens.TotpConfig = {
          label: "some label",
          issuer: "some issuer",
          secret: "some secret",
          algorithm: "some algorithm",
          digits: "some digits",
          period: "some period"
        }
        const NEW_DISPLAY_NAME = "some new display name"
        const DISPLAY_NAME_UPDATE = JSON.stringify({
          token: SOME_TOKEN,
          value: { name: NEW_DISPLAY_NAME }
        })
        const settingsStorageMock = setupSettingsStorageMock(
          UPDATE_DISPLAY_NAME_SETTINGS_KEY,
          DISPLAY_NAME_UPDATE
        )
        const updateDisplayNameSpy = jest.spyOn(tokens, "updateDisplayName")
        initialize()

        settingsStorageMock.setItem(
          UPDATE_DISPLAY_NAME_SETTINGS_KEY,
          DISPLAY_NAME_UPDATE
        )

        expect(updateDisplayNameSpy).toBeCalledWith(
          SOME_TOKEN,
          NEW_DISPLAY_NAME
        )
        updateDisplayNameSpy.mockRestore()
      })

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
        initialize()
        const clearValidationsSpy = jest.spyOn(
          validation,
          "clearAllValidationMessages"
        )
        const clearFieldsSpy = jest.spyOn(
          fields,
          "clearAddTokenManuallyFieldsViaSettings"
        )

        settingsStorageMock.setItem(NewTokenButton.reset, SOME_STRINGIFIED_JSON)

        expect(clearFieldsSpy).toBeCalled()
        expect(clearValidationsSpy).toBeCalled()
        clearFieldsSpy.mockRestore()
        clearValidationsSpy.mockRestore()
      })

      function setupSettingsStorageMock(
        eventKey: string,
        newValue = '"some new value JSON"'
      ) {
        const changeEvent: StorageChangeEvent = {
          key: eventKey,
          defaultPrevented: false,
          newValue,
          oldValue: '"some old value JSON"',
          target: undefined,
          type: "some type",
          preventDefault: undefined,
          stopImmediatePropagation: undefined,
          stopPropagation: undefined
        }
        const settingsStorageMock = jest.mocked(settings).settingsStorage
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
