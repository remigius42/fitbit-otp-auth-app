import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import * as settings from "settings"

import {
  fallbackToDefaultSettings,
  isCompensatingClockDrift,
  isStoringTokensOnDevice
} from "../settings"
import { SettingsButton } from "../ui/SettingsButton"

describe("settings", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("fallbackToDefaultSettings", () => {
    it("enables clock drift compensation", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() => null)

      fallbackToDefaultSettings()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        SettingsButton.compensateClockDrift,
        "true"
      )
    })

    it("does not store tokens on the device by default to increase security", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() => null)

      fallbackToDefaultSettings()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        SettingsButton.storeTokensOnDevice,
        "false"
      )
    })

    it("does not use the enlarged tokens view by default", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(() => null)

      fallbackToDefaultSettings()

      expect(settingsStorageMock.setItem).toBeCalledWith(
        SettingsButton.showEnlargedTokensView,
        "false"
      )
    })
  })

  describe("isCompensatingClockDrift", () => {
    it("returns true if clock drift compensation is enabled", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation((key: string) =>
        key === SettingsButton.compensateClockDrift ? "true" : null
      )

      expect(isCompensatingClockDrift()).toBe(true)
    })

    it("returns false if clock drift compensation is disabled", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation((key: string) =>
        key === SettingsButton.compensateClockDrift ? "false" : null
      )

      expect(isCompensatingClockDrift()).toBe(false)
    })
  })

  describe("isStoringTokensOnDevice", () => {
    it("returns true if tokens are to be stored on the device", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation((key: string) =>
        key === SettingsButton.storeTokensOnDevice ? "true" : null
      )

      expect(isStoringTokensOnDevice()).toBe(true)
    })

    it("returns false if tokens are not to be stored on the device", () => {
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation((key: string) =>
        key === SettingsButton.storeTokensOnDevice ? "false" : null
      )

      expect(isStoringTokensOnDevice()).toBe(false)
    })
  })
})
