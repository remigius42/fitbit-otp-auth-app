import { fsMockFactory } from "../__mocks__/fs"
jest.doMock("fs", fsMockFactory, { virtual: true })

import * as fs from "fs"
import { ColorSchemeName } from "../../common/ColorSchemes"
import { SettingsManager } from "../SettingsManager"

describe("SettingsManager", () => {
  describe("by default", () => {
    it("does not use the enlarged tokens view", () => {
      const settingsManager = new SettingsManager()

      const defaultSettings = settingsManager.getSettings()
      expect(defaultSettings.shouldUseLargeTokenView).toBe(false)
    })

    it("uses the default color scheme", () => {
      const settingsManager = new SettingsManager()

      const defaultSettings = settingsManager.getSettings()
      expect(defaultSettings.colorScheme).toBe(ColorSchemeName.default)
    })
  })

  describe("restoreSettings", () => {
    it("does not try to read the stored settings if the file does not exist", () => {
      const fsMock = jest.mocked(fs)
      fsMock.existsSync.mockImplementation((filename: string) =>
        filename === SettingsManager.SETTINGS_CBOR_PATH ? false : true
      )
      const settingsManager = new SettingsManager()

      settingsManager.restoreSettings()

      expect(fsMock.readFileSync).not.toBeCalled()
    })

    it("restores the stored settings if the settings file exists", () => {
      const fsMock = jest.mocked(fs)
      fsMock.existsSync.mockImplementation((filename: string) =>
        filename === SettingsManager.SETTINGS_CBOR_PATH ? true : false
      )
      const STORED_SETTINGS = {
        shouldUseLargeTokenView: true,
        colorScheme: ColorSchemeName.default
      }
      fsMock.readFileSync.mockImplementation((filename: string) =>
        filename === SettingsManager.SETTINGS_CBOR_PATH ? STORED_SETTINGS : {}
      )
      const settingsManager = new SettingsManager()

      settingsManager.restoreSettings()

      expect(fsMock.readFileSync).toBeCalledWith(
        SettingsManager.SETTINGS_CBOR_PATH,
        "cbor"
      )
      const restoredSettings = settingsManager.getSettings()
      expect(restoredSettings).toStrictEqual(STORED_SETTINGS)
    })
  })

  describe("getSettings", () => {
    it("returns the current settings", () => {
      const CURRENT_SETTINGS = {
        shouldUseLargeTokenView: true,
        colorScheme: ColorSchemeName.fb_aqua
      }
      const settingsManager = new SettingsManager()
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: CURRENT_SETTINGS
      })

      expect(settingsManager.getSettings()).toStrictEqual(CURRENT_SETTINGS)
    })
  })

  describe("updateSettings", () => {
    it("sets the updated settings to their new values", () => {
      const UPDATED_SETTINGS = { shouldUseLargeTokenView: false }
      const settingsManager = new SettingsManager()

      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: UPDATED_SETTINGS
      })

      const updatedSettings = settingsManager.getSettings()
      expect(updatedSettings.shouldUseLargeTokenView).toStrictEqual(
        UPDATED_SETTINGS.shouldUseLargeTokenView
      )
    })

    it("preserves the non-updated values", () => {
      const UPDATED_SETTINGS = {}
      const settingsManager = new SettingsManager()
      const initialShouldUseLargeTokenViewSetting =
        settingsManager.getSettings().shouldUseLargeTokenView

      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: UPDATED_SETTINGS
      })

      const updatedSettings = settingsManager.getSettings()
      expect(updatedSettings.shouldUseLargeTokenView).toStrictEqual(
        initialShouldUseLargeTokenViewSetting
      )
    })

    it("stores the updated settings on the device", () => {
      const fsMock = jest.mocked(fs)
      const UPDATED_SETTINGS = {
        shouldUseLargeTokenView: true,
        colorScheme: ColorSchemeName.white
      }
      const settingsManager = new SettingsManager()
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: {
          shouldUseLargeTokenView: false,
          colorScheme: ColorSchemeName.fb_pink
        }
      })
      expect(settingsManager.getSettings().shouldUseLargeTokenView).toBe(false)
      expect(settingsManager.getSettings().colorScheme).toBe(
        ColorSchemeName.fb_pink
      )

      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: UPDATED_SETTINGS
      })

      expect(fsMock.writeFileSync).toBeCalledWith(
        SettingsManager.SETTINGS_CBOR_PATH,
        UPDATED_SETTINGS,
        expect.any(String)
      )
    })

    it("triggers the observers", () => {
      const settingsManager = new SettingsManager()
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { shouldUseLargeTokenView: false }
      })
      expect(settingsManager.getSettings().shouldUseLargeTokenView).toBe(false)
      const someObserver = jest.fn()
      const someOtherObserver = jest.fn()
      settingsManager.registerObserver(someObserver)
      settingsManager.registerObserver(someOtherObserver)

      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { shouldUseLargeTokenView: true }
      })

      expect(someObserver).toBeCalled()
      expect(someOtherObserver).toBeCalled()
    })
  })

  describe("registerObserver", () => {
    it("adds observers", () => {
      const settingsManager = new SettingsManager()
      const someObserver = () => "do something"
      settingsManager.registerObserver(someObserver)
      const someOtherObserver = () => "do something else"

      settingsManager.registerObserver(someOtherObserver)

      expect(settingsManager.getObservers()).toStrictEqual([
        someObserver,
        someOtherObserver
      ])
    })
  })

  describe("getObservers", () => {
    it("returns the currently registered observers", () => {
      const settingsManager = new SettingsManager()
      const someObserver = () => "do something"
      settingsManager.registerObserver(someObserver)

      expect(settingsManager.getObservers()).toStrictEqual([someObserver])
    })
  })
})
