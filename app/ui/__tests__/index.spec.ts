import { documentMockFactory } from "../../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import document from "document"
import {
  registerDelayedMessageWhetherDeviceIsConnected,
  showNoTokensAvailableMessage,
  showTokens
} from ".."
import {
  ADD_TOKENS_VIEW_PATH,
  RETRIEVING_TOKENS_CONNECTION_ISSUE_ID,
  RETRIEVING_TOKENS_ID,
  TOKENS_VIEW_PATH
} from "../ids"

describe("ui", () => {
  beforeAll(() => jest.useFakeTimers())

  describe("registerDelayedMessageWhetherDeviceIsConnected", () => {
    describe("if the current view is the index view", () => {
      it("shows the check connection message after an initial wait time", () => {
        registerDelayedMessageWhetherDeviceIsConnected()

        jest.advanceTimersToNextTimer()

        const checkConnectionElement = document.getElementById(
          RETRIEVING_TOKENS_CONNECTION_ISSUE_ID
        ) as GraphicsElement
        expect(checkConnectionElement.style.display).toBe("inline")
      })

      it("hides the initial message after an initial wait time", () => {
        registerDelayedMessageWhetherDeviceIsConnected()

        jest.advanceTimersByTime(6000)

        const initialMessageElement = document.getElementById(
          RETRIEVING_TOKENS_ID
        ) as GraphicsElement
        expect(initialMessageElement.style.display).toBe("none")
      })
    })
    it("has no effect if the current view is not the index view", async () => {
      const documentMock = jest.mocked(document)
      await documentMock.location.replace("some other path")
      const getElementByIdSpy = jest.spyOn(document, "getElementById")
      registerDelayedMessageWhetherDeviceIsConnected()

      jest.advanceTimersToNextTimer()

      expect(getElementByIdSpy).not.toBeCalledWith(RETRIEVING_TOKENS_ID)
      expect(getElementByIdSpy).not.toBeCalledWith(
        RETRIEVING_TOKENS_CONNECTION_ISSUE_ID
      )
      getElementByIdSpy.mockRestore()
    })
  })

  describe("showNoTokensAvailableMessage", () => {
    it("replaces with the correct view", async () => {
      const documentMock = jest.mocked(document)

      await showNoTokensAvailableMessage()

      expect(documentMock.location.pathname).toBe(ADD_TOKENS_VIEW_PATH)
    })
  })

  describe("showTokens", () => {
    it("replaces with the correct view", async () => {
      const documentMock = jest.mocked(document)

      await showTokens()

      expect(documentMock.location.pathname).toBe(TOKENS_VIEW_PATH)
    })
  })
})
