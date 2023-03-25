import { settingsMockFactory } from "../../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import * as settings from "settings"
import { getValidationMessageSetting } from "../../../settings/ui"
import { NewTokenButton } from "../NewTokenButton"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../NewTokenFieldName"
import {
  clearAllValidationMessages,
  clearValidationForAllFields,
  updateValidationForField
} from "../validation"

describe("validation", () => {
  beforeEach(jest.clearAllMocks)

  describe("updateValidationForField", () => {
    it("should set the validation message if there is an error for the field", () => {
      const SOME_FIELD_NAME = NewTokenFieldName.label
      const SOME_VALIDATION_ERROR = "some validation error"
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      updateValidationForField(
        new Map([[SOME_FIELD_NAME, SOME_VALIDATION_ERROR]]),
        SOME_FIELD_NAME
      )

      expect(settingsStorageMock.setItem).toBeCalledWith(
        getValidationErrorSetting(SOME_FIELD_NAME),
        SOME_VALIDATION_ERROR
      )
    })

    it("should remove the validation message setting to clear it if there is no error", () => {
      const SOME_FIELD_NAME = NewTokenFieldName.label
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      updateValidationForField(new Map(), SOME_FIELD_NAME)

      expect(settingsStorageMock.removeItem).toBeCalledWith(
        getValidationErrorSetting(SOME_FIELD_NAME)
      )
    })

    it("should remove the validation message setting to clear it if there is no error for the field", () => {
      const SOME_FIELD_NAME = NewTokenFieldName.label
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      updateValidationForField(
        new Map([[NewTokenFieldName.issuer, "some validation error"]]),
        SOME_FIELD_NAME
      )

      expect(settingsStorageMock.removeItem).toBeCalledWith(
        getValidationErrorSetting(SOME_FIELD_NAME)
      )
    })
  })

  describe("clearAllValidationMessages", () => {
    it("should remove settings entries for all validation messages", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      clearAllValidationMessages()

      NewTokenFieldNameValues.forEach(fieldName =>
        expect(settingsStorageMock.removeItem).toBeCalledWith(
          getValidationErrorSetting(fieldName)
        )
      )
      expect(settingsStorageMock.removeItem).toBeCalledWith(
        getValidationMessageSetting(NewTokenButton.addToken)
      )
    })
  })

  describe("clearValidationForAllFields", () => {
    it("should remove the settings entries for all field validation messages", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      clearValidationForAllFields()

      NewTokenFieldNameValues.forEach(fieldName =>
        expect(settingsStorageMock.removeItem).toBeCalledWith(
          getValidationErrorSetting(fieldName)
        )
      )
    })
  })

  function getValidationErrorSetting(fieldName: NewTokenFieldName) {
    return fieldName + "Error"
  }
})
