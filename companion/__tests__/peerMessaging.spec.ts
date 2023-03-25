import { settingsMockFactory } from "../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { messagingMockFactory, PeerSocketMock } from "../__mocks__/messaging"
jest.doMock("messaging", messagingMockFactory, { virtual: true })

import * as messaging from "messaging"
import * as settings from "settings"
import { AppSettings } from "../../common/AppSettings"
import type { TotpConfig } from "../../common/TotpConfig"
import {
  sendSettingsWhenDeviceIsReady,
  sendTokensToDevice,
  sendTokensWhenDeviceIsReady,
  updateSettings
} from "../peerMessaging"
import { TOKENS_SETTINGS_KEY } from "../tokens"
import { SettingsButton } from "../ui/SettingsButton"

describe("peerMessaging", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const settingsStorageMock = jest.mocked(settings).settingsStorage
    settingsStorageMock.getItem.mockImplementation((key: string) => {
      if (key === TOKENS_SETTINGS_KEY) {
        return SOME_JSON_STRINGIFIED_TOKENS
      } else if (key === SettingsButton.compensateClockDrift) {
        return "true"
      } else if (key === SettingsButton.storeTokensOnDevice) {
        return "false"
      } else if (key === SettingsButton.showEnlargedTokensView) {
        return "false"
      }
    })
  })
  afterEach(() => {
    const peerSocketMock = jest.mocked(messaging).peerSocket
    ;(peerSocketMock as unknown as PeerSocketMock).mockReset()
  })

  const SOME_FIRST_TOKEN: TotpConfig = {
    label: "some first token label",
    secret: "some secret",
    algorithm: "some algorithm",
    digits: "some digits",
    period: "some period"
  }
  const SOME_SECOND_TOKEN: TotpConfig = {
    ...SOME_FIRST_TOKEN,
    label: "some second token label"
  }
  const SOME_TOKENS = [SOME_FIRST_TOKEN, SOME_SECOND_TOKEN]
  const SOME_JSON_STRINGIFIED_TOKENS = JSON.stringify(SOME_TOKENS)

  const SOME_SETTINGS_UPDATE: Partial<AppSettings> = {
    shouldUseLargeTokenView: true
  }

  describe("sendTokensWhenDeviceIsReady", () => {
    it("sends the current tokens as soon the device is ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket

      sendTokensWhenDeviceIsReady()
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: SOME_TOKENS.length,
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
    })

    it("does not send the tokens if the device is not ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket

      sendTokensWhenDeviceIsReady()

      expect(peerSocketMock.send).not.toBeCalled()
    })

    it("sends an empty token update sequence if there are no tokens to inform device", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(key => {
        if (key === TOKENS_SETTINGS_KEY) {
          return undefined
        } else if (key === SettingsButton.compensateClockDrift) {
          return "true"
        } else if (key === SettingsButton.storeTokensOnDevice) {
          return "false"
        }
      })

      sendTokensWhenDeviceIsReady()
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      expect(peerSocketMock.send).toBeCalledWith({
        count: 0,
        type: "UPDATE_TOKENS_START_MESSAGE",
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })
    })
  })

  describe("sendSettingsWhenDeviceIsReady", () => {
    it("sends the settings as soon the device is ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      const settingsStorageMock = jest.mocked(settings).settingsStorage

      sendSettingsWhenDeviceIsReady()
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      const expectedSettings = {
        shouldUseLargeTokenView: JSON.parse(
          settingsStorageMock.getItem(SettingsButton.showEnlargedTokensView)
        ) as boolean
      }
      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: expectedSettings
      })
    })

    it("does not send the settings if the device is not ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket

      sendSettingsWhenDeviceIsReady()

      expect(peerSocketMock.send).not.toBeCalled()
    })
  })

  describe("sendTokensToDevice", () => {
    it("sends tokens individually", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toBeCalledWith({
        type: expect.any(String) as string,
        index: expect.any(Number) as number,
        token: SOME_FIRST_TOKEN
      })
      expect(peerSocketMock.send).toBeCalledWith({
        type: expect.any(String) as string,
        index: expect.any(Number) as number,
        token: SOME_SECOND_TOKEN
      })
    })

    it("begins with an update start message", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: expect.any(Number) as number,
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
    })

    it("signals the expected number of tokens in the start message", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: SOME_TOKENS.length,
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
    })

    it("sends the current seconds since epoch in the start message if clock drift is compensated", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      jest.useFakeTimers()
      jest.setSystemTime(SOME_SECONDS_SINCE_EPOCH * 1000)
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: expect.any(Number) as number,
        secondsSinceEpochInCompanion: 42
      })
      jest.useRealTimers()
    })

    it("does not send the current seconds since epoch in the start message if clock drift compensation is disabled", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      jest.useFakeTimers()
      jest.setSystemTime(SOME_SECONDS_SINCE_EPOCH * 1000)
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(key => {
        if (key === TOKENS_SETTINGS_KEY) {
          return SOME_JSON_STRINGIFIED_TOKENS
        } else if (key === SettingsButton.compensateClockDrift) {
          return "false"
        } else if (key === SettingsButton.storeTokensOnDevice) {
          return "false"
        }
      })

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).not.toBeCalledWith({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: expect.any(Number) as number,
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: expect.any(Number) as number
      })
      jest.useRealTimers()
    })

    it("instructs device to store tokens if store tokens on device is enabled", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(key => {
        if (key === TOKENS_SETTINGS_KEY) {
          return SOME_JSON_STRINGIFIED_TOKENS
        } else if (key === SettingsButton.storeTokensOnDevice) {
          return "true"
        } else if (key === SettingsButton.compensateClockDrift) {
          return "true"
        }
      })

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: SOME_TOKENS.length,
        secondsSinceEpochInCompanion: expect.any(Number) as number,
        storeTokensOnDevice: true
      })
    })

    it("does not instruct device to store tokens if store tokens on device is disabled", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()
      const settingsStorageMock = jest.mocked(settings).settingsStorage
      settingsStorageMock.getItem.mockImplementation(key => {
        if (key === TOKENS_SETTINGS_KEY) {
          return SOME_JSON_STRINGIFIED_TOKENS
        } else if (key === SettingsButton.storeTokensOnDevice) {
          return "false"
        } else if (key === SettingsButton.compensateClockDrift) {
          return "true"
        }
      })

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenNthCalledWith(1, {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: SOME_TOKENS.length,
        secondsSinceEpochInCompanion: expect.any(Number) as number
      })
    })

    it("sends the tokens with update token messages", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index: expect.any(Number) as number,
        token: SOME_FIRST_TOKEN
      })
      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index: expect.any(Number) as number,
        token: SOME_SECOND_TOKEN
      })
    })

    it("includes the current token index in the update token messages", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toBeCalledWith({
        type: expect.any(String) as string,
        index: 0,
        token: SOME_FIRST_TOKEN
      })
      expect(peerSocketMock.send).toBeCalledWith({
        type: expect.any(String) as string,
        index: 1,
        token: SOME_SECOND_TOKEN
      })
    })

    it("ends with an update end message", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).toHaveBeenLastCalledWith({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })
    })

    it("does not send the tokens if the device is not ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket

      sendTokensToDevice(SOME_TOKENS)

      expect(peerSocketMock.send).not.toBeCalled()
      expect(peerSocketMock.readyState).toBe(peerSocketMock.CLOSED)
    })
  })

  describe("updateSettings", () => {
    it("sends an update settings message to the device", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      ;(peerSocketMock as unknown as PeerSocketMock).openSocket()

      updateSettings(SOME_SETTINGS_UPDATE)

      expect(peerSocketMock.send).toBeCalledWith({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: SOME_SETTINGS_UPDATE
      })
    })

    it("does not send the settings if the device is not ready", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket

      updateSettings(SOME_SETTINGS_UPDATE)

      expect(peerSocketMock.send).not.toBeCalled()
      expect(peerSocketMock.readyState).toBe(peerSocketMock.CLOSED)
    })
  })
})
