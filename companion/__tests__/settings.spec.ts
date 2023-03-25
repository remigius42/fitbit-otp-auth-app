import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import * as settings from "settings"

import {
  fallbackToDefaultSettings,
  isCompensatingClockDrift
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
})
