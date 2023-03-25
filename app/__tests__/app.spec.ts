import { documentMockFactory } from "../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import {
  messagingMockFactory,
  PeerSocketMock
} from "../../companion/__mocks__/messaging"
jest.doMock("messaging", messagingMockFactory, { virtual: true })

import * as messaging from "messaging"
import { PeerMessage } from "../../common/PeerMessage"
import type { TotpConfig } from "../../common/TotpConfig"
import { initialize } from "../app"
import { TokenManager } from "../TokenManager"
import * as ui from "../ui"

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
      it("dispatches to the TokenManager upon receiving a message", () => {
        const SOME_UPDATE_TOKENS_MESSAGE = { type: "UPDATE_TOKENS_END_MESSAGE" }
        const SOME_MESSAGE = { data: SOME_UPDATE_TOKENS_MESSAGE }
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        const handleUpdateTokensMessageSpy = jest.spyOn(
          TokenManager.prototype,
          "handleUpdateTokensMessage"
        )

        ;(peerSocketMock as unknown as PeerSocketMock).receive(SOME_MESSAGE)

        expect(handleUpdateTokensMessageSpy).toBeCalledWith(
          SOME_UPDATE_TOKENS_MESSAGE
        )
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

    describe("registers an observer on the tokenManager which", () => {
      const SOME_TOKEN: TotpConfig = {
        label: "some label",
        secret: "some secret",
        algorithm: "some algorithm",
        digits: "some digits",
        period: "some period"
      }

      it("invokes the function to show the tokens if the token manager has any", () => {
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        const showTokensSpy = jest.spyOn(ui, "showTokens")

        receiveTokenUpdate(peerSocketMock as unknown as PeerSocketMock, [
          SOME_TOKEN
        ])

        expect(showTokensSpy).toBeCalled()
      })

      it("invokes the function to show the no tokens available message if the token manager doesn't have any tokens", () => {
        const peerSocketMock = jest.mocked(messaging).peerSocket
        initialize()
        receiveTokenUpdate(peerSocketMock as unknown as PeerSocketMock, [
          SOME_TOKEN
        ])
        const showNoTokensAvailableMessageSpy = jest.spyOn(
          ui,
          "showNoTokensAvailableMessage"
        )

        receiveTokenUpdate(peerSocketMock as unknown as PeerSocketMock, [])

        expect(showNoTokensAvailableMessageSpy).toBeCalled()
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
})
