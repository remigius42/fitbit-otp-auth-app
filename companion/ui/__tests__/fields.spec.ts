import { settingsMockFactory } from "../../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import * as settings from "settings"
import {
  clearAddTokenManuallyFieldsViaSettings,
  getSingleSelectValueFromSettings,
  getTextFieldValueFromSettings
} from "../fields"
import { NewTokenFieldNameValues } from "../NewTokenFieldName"

describe("fields", () => {
  beforeEach(jest.clearAllMocks)

  describe("getTextFieldValueFromSettings", () => {
    it("should retrieve the value based on the key", () => {
      const SOME_FIELD_NAME = "some field name"
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      getTextFieldValueFromSettings(SOME_FIELD_NAME)
      expect(settingsStorageMock.getItem).toBeCalledWith(SOME_FIELD_NAME)
    })

    it("should return the value of the name property in the serialized setting", () => {
      const SOME_FIELD_VALUE = "some field value"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() =>
        JSON.stringify({ name: SOME_FIELD_VALUE })
      )

      const value = getTextFieldValueFromSettings("some field name")

      expect(value).toBe(SOME_FIELD_VALUE)
    })

    it("should return the empty string if the setting is missing", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() => undefined)

      const value = getTextFieldValueFromSettings("doesNotExist")

      expect(value).toBe("")
    })
  })

  describe("getSingleSelectValueFromSettings", () => {
    it("should retrieve the value based on the key", () => {
      const SOME_FIELD_NAME = "some field name"
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      getSingleSelectValueFromSettings(SOME_FIELD_NAME)

      expect(settingsStorageMock.getItem).toBeCalledWith(SOME_FIELD_NAME)
    })

    it("should return the value of the name property of the first value entry in the serialized setting", () => {
      const SOME_FIELD_VALUE = "some field value"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() =>
        JSON.stringify({ values: [{ name: SOME_FIELD_VALUE }] })
      )

      const value = getSingleSelectValueFromSettings("some field name")

      expect(value).toBe(SOME_FIELD_VALUE)
    })

    it("should return the empty string if the values property is an empty array in serialized setting", () => {
      const SOME_FIELD_NAME = "some field name"
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() =>
        JSON.stringify({ values: [] })
      )

      const value = getSingleSelectValueFromSettings(SOME_FIELD_NAME)

      expect(value).toBe("")
    })

    it("should return the empty string if the setting is missing", () => {
      const value = getSingleSelectValueFromSettings("doesNotExist")

      expect(value).toBe("")
    })
  })

  describe("clearAddTokenManuallyFieldsViaSettings", () => {
    it("should set all related fields to the empty string", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      clearAddTokenManuallyFieldsViaSettings()

      NewTokenFieldNameValues.forEach(fieldName => {
        expect(settingsStorageMock.setItem).toBeCalledWith(fieldName, "")
      })
    })

    it("should only set related fields", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      clearAddTokenManuallyFieldsViaSettings()

      NewTokenFieldNameValues.forEach(fieldName => {
        expect(settingsStorageMock.setItem).toBeCalledWith(
          fieldName,
          expect.any(String)
        )
      })
      expect(settingsStorageMock.setItem).toBeCalledTimes(
        NewTokenFieldNameValues.length
      )
    })
  })
})
