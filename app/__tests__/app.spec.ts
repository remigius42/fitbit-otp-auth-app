import { documentMockFactory } from "../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import { fsMockFactory } from "../__mocks__/fs"
jest.doMock("fs", fsMockFactory, { virtual: true })

import {
  messagingMockFactory,
  PeerSocketMock
} from "../../companion/__mocks__/messaging"
jest.doMock("messaging", messagingMockFactory, { virtual: true })

jest.doMock("clock", () => ({}), { virtual: true })

import * as messaging from "messaging"
import { PeerMessage, UpdateTokensMessage } from "../../common/PeerMessage"
import type { TotpConfig } from "../../common/TotpConfig"
import { initialize } from "../app"
import { SettingsManager } from "../SettingsManager"
import { TokenManager } from "../TokenManager"
import * as ui from "../ui"
import * as colors from "../ui/colors"

describe("app", () => {
  beforeAll(() => jest.useFakeTimers())
  afterEach(() => {
    jest.restoreAllMocks()

    const peerSocketMock = jest.mocked(messaging).peerSocket
    ;(peerSocketMock as unknown as PeerSocketMock).mockReset()
  })

  describe("initialize", () => {
    it("adds a peerSocket listener", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      const messageEventListeners = (
        peerSocketMock as unknown as PeerSocketMock
      ).messageEventListeners

      expect(messageEventListeners.length).toBe(0)
      initialize()

      expect(messageEventListeners.length).toBe(1)
    })

    describe("adds a peerSocket listener which", () => {
      const TOKEN_UPDATE_MESSAGES: Array<UpdateTokensMessage> = [
        { type: "UPDATE_TOKENS_START_MESSAGE", count: 0 },
        {
          type: "UPDATE_TOKENS_TOKEN_MESSAGE",
          index: 0,
          token: {
            label: "some label",
            secret: "some secret",
            algorithm: "some algorithm",
            period: "some period",
            digits: "some digits"
          }
        },
        {
          type: "UPDATE_TOKENS_END_MESSAGE"
        }
      ]

      it.each(TOKEN_UPDATE_MESSAGES)(
        "dispatches to the token manager upon receiving an update token message of type $type",
        (updateTokenMessage: UpdateTokensMessage) => {
          const peerSocketMock = jest.mocked(messaging).peerSocket
          initialize()
          const handleUpdateTokensMessageSpy = jest.spyOn(
            TokenManager.prototype,
            "handleUpdateTokensMessage"
          )

          ;(peerSocketMock as unknown as PeerSocketMock).receive({
            data: updateTokenMessage
          })

          expect(handleUpdateTokensMessageSpy).toBeCalledWith(
            updateTokenMessage
          )
        }
      )

      it.each(TOKEN_UPDATE_MESSAGES)(
        "does not dispatch to the settings manager upon receiving an update token message of type $type",
        (updateTokenMessage: UpdateTokensMessage) => {
          const peerSocketMock = jest.mocked(messaging).peerSocket
          initialize()
          const handleUpdateSettingsMessageSpy = jest.spyOn(
            SettingsManager.prototype,
            "updateSettings"
          )

          ;(peerSocketMock as unknown as PeerSocketMock).receive({
            data: updateTokenMessage
          })

          expect(handleUpdateSettingsMessageSpy).not.toBeCalled()
        }
      )

      it("dispatches to the settings manager upon receiving an update settings message", () => {
        const SOME_UPDATE_SETTINGS_MESSAGE = {
          type: "UPDATE_SETTINGS_MESSAGE",
          updatedSettings: {}
        }
        const SOME_MESSAGE = { data: SOME_UPDATE_SETTINGS_MESSAGE }
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        const handleUpdateSettingsMessageSpy = jest.spyOn(
          SettingsManager.prototype,
          "updateSettings"
        )

        ;(peerSocketMock as unknown as PeerSocketMock).receive(SOME_MESSAGE)

        expect(handleUpdateSettingsMessageSpy).toBeCalledWith(
          SOME_UPDATE_SETTINGS_MESSAGE
        )
      })

      it("does not dispatch to the token manager upon receiving an update settings message", () => {
        const SOME_UPDATE_SETTINGS_MESSAGE = {
          type: "UPDATE_SETTINGS_MESSAGE",
          updatedSettings: {}
        }
        const SOME_MESSAGE = { data: SOME_UPDATE_SETTINGS_MESSAGE }
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        const handleUpdateTokensMessageSpy = jest.spyOn(
          TokenManager.prototype,
          "handleUpdateTokensMessage"
        )

        ;(peerSocketMock as unknown as PeerSocketMock).receive(SOME_MESSAGE)

        expect(handleUpdateTokensMessageSpy).not.toBeCalled()
      })
    })

    it("registers a delayed message suggesting to check connectivity", () => {
      const registerDelayedMessageWhetherDeviceIsConnectedSpy = jest.spyOn(
        ui,
        "registerDelayedMessageWhetherDeviceIsConnected"
      )

      initialize()

      expect(registerDelayedMessageWhetherDeviceIsConnectedSpy).toBeCalled()
    })

    it("registers an observer on the settings manager which triggers a UI update", () => {
      const peerSocketMock = jest.mocked(messaging).peerSocket
      initialize()
      const updateUiSpy = jest.spyOn(ui, "updateUi")

      ;(peerSocketMock as unknown as PeerSocketMock).receive({
        data: { type: "UPDATE_SETTINGS_MESSAGE", updatedSettings: {} }
      })

      expect(updateUiSpy).toBeCalled()
    })

    it("invokes method on settings manager to restore the settings", () => {
      const restoreSettingsSpy = jest.spyOn(
        SettingsManager.prototype,
        "restoreSettings"
      )

      initialize()

      expect(restoreSettingsSpy).toBeCalled()
    })

    it("invokes function to update the UI colors", () => {
      const updateColorsSpy = jest.spyOn(colors, "updateColors")

      initialize()

      expect(updateColorsSpy).toBeCalled()
    })

    it("invokes function to update the UI colors after having restored the settings", () => {
      const observedCalls = []
      const restoreSettings = "restoreSettings"
      jest
        .spyOn(SettingsManager.prototype, restoreSettings)
        .mockImplementation(() => observedCalls.push(restoreSettings))
      const updateColors = "updateColors"
      jest
        .spyOn(colors, updateColors)
        .mockImplementation(() => observedCalls.push(updateColors))

      initialize()

      expect(observedCalls).toStrictEqual([restoreSettings, updateColors])
    })

    describe("registers an observer on the token manager which", () => {
      it("triggers a UI update", () => {
        const SOME_TOKEN: TotpConfig = {
          label: "some label",
          secret: "some secret",
          algorithm: "some algorithm",
          digits: "some digits",
          period: "some period"
        }
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        const updateUiSpy = jest.spyOn(ui, "updateUi")

        receiveTokenUpdate(peerSocketMock as unknown as PeerSocketMock, [
          SOME_TOKEN
        ])

        expect(updateUiSpy).toBeCalled()
      })

      it("is registered before the token manager tries to restore the tokens", () => {
        const observedCalls = []
        const registerObserver = "registerObserver"
        jest
          .spyOn(TokenManager.prototype, registerObserver)
          .mockImplementation(() => observedCalls.push(registerObserver))
        const tryRestoreFromDevice = "tryRestoreFromDevice"
        jest
          .spyOn(TokenManager.prototype, tryRestoreFromDevice)
          .mockImplementation(() => observedCalls.push(tryRestoreFromDevice))

        initialize()

        expect(observedCalls).toStrictEqual([
          registerObserver,
          tryRestoreFromDevice
        ])
      })
    })

    it("invokes method on token manager to try to restore the tokens", () => {
      const tryRestoreFromDeviceSpy = jest.spyOn(
        TokenManager.prototype,
        "tryRestoreFromDevice"
      )

      initialize()

      expect(tryRestoreFromDeviceSpy).toBeCalled()
    })

    function receiveTokenUpdate(
      peerSocketMock: PeerSocketMock,
      tokens: Array<TotpConfig>
    ) {
      const START_MESSAGE: PeerMessage = {
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: tokens.length
      }
      peerSocketMock.receive({ data: START_MESSAGE })

      tokens.forEach((token, index) => {
        const TOKEN_MESSAGE: PeerMessage = {
          type: "UPDATE_TOKENS_TOKEN_MESSAGE",
          index,
          token
        }
        peerSocketMock.receive({ data: TOKEN_MESSAGE })
      })

      const END_MESSAGE: PeerMessage = {
        type: "UPDATE_TOKENS_END_MESSAGE"
      }
      peerSocketMock.receive({ data: END_MESSAGE })
    }
  })
})
