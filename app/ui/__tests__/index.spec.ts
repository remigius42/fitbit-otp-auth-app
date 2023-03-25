/* spell-checker:ignore ontick */

import { documentMockFactory } from "../../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

jest.doMock("clock", () => ({ granularity: "hours", ontick: jest.fn() }), {
  virtual: true
})

import { fsMockFactory } from "../../__mocks__/fs"
jest.doMock("fs", fsMockFactory, { virtual: true })

import clock, { TickEvent } from "clock"
import document from "document"
import * as fs from "fs"
import { registerDelayedMessageWhetherDeviceIsConnected, updateUi } from ".."
import { TotpConfig } from "../../../common/TotpConfig"
import { SettingsManager } from "../../SettingsManager"
import { TokenManager } from "../../TokenManager"
import * as colors from "../colors"
import {
  ADD_TOKENS_VIEW_PATH,
  RETRIEVING_TOKENS_CONNECTION_ISSUE_ID,
  RETRIEVING_TOKENS_ID,
  TOKENS_VIEW_LARGE_PATH,
  TOKENS_VIEW_PATH
} from "../ids"
import * as tokens from "../tokens"

describe("ui", () => {
  beforeAll(() => jest.useFakeTimers())
  beforeEach(() => jest.clearAllMocks())

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

  describe("updateUI", () => {
    const dummySettingsManager = new SettingsManager()

    describe("if the token manager has tokens", () => {
      const tokenManagerWithTokens = new TokenManager()
      const SOME_TOKEN: TotpConfig = {
        label: "some label",
        secret: "some secret",
        algorithm: "some algorithm",
        digits: "some digits",
        period: "some period"
      }

      beforeAll(() => {
        const fsMock = jest.mocked(fs)
        fsMock.existsSync.mockImplementation((filename: string) =>
          filename === TokenManager.TOKENS_CBOR_PATH ? true : false
        )
        fsMock.readFileSync.mockImplementation((filename: string) =>
          filename === TokenManager.TOKENS_CBOR_PATH ? [SOME_TOKEN] : undefined
        )
        tokenManagerWithTokens.tryRestoreFromDevice()
      })

      describe("depending on the setting whether to use the large tokens view", () => {
        it("does not replace with the large tokens view if the setting is disabled", async () => {
          const documentMock = jest.mocked(document)
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView: false }
          })

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(documentMock.location.pathname).toBe(TOKENS_VIEW_PATH)
        })

        it("replaces with the large tokens view if the setting is enabled", async () => {
          const documentMock = jest.mocked(document)
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView: true }
          })

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(documentMock.location.pathname).toBe(TOKENS_VIEW_LARGE_PATH)
        })

        it("only changes the document location to the default token view if necessary to prevent flickering", async () => {
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView: false }
          })
          await document.location.replace(TOKENS_VIEW_PATH)
          const replaceSpy = jest.spyOn(document.location, "replace")
          const assignSpy = jest.spyOn(document.location, "assign")

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(replaceSpy).not.toBeCalled()
          expect(assignSpy).not.toBeCalled()
          replaceSpy.mockRestore()
          assignSpy.mockRestore()
        })

        it("only changes the document location to the large token view if necessary to prevent flickering", async () => {
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView: true }
          })
          await document.location.replace(TOKENS_VIEW_LARGE_PATH)
          const replaceSpy = jest.spyOn(document.location, "replace")
          const assignSpy = jest.spyOn(document.location, "assign")

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(replaceSpy).not.toBeCalled()
          expect(assignSpy).not.toBeCalled()
          replaceSpy.mockRestore()
          assignSpy.mockRestore()
        })
      })

      it("registers an ontick listener", async () => {
        clock.ontick = undefined

        await updateUi(tokenManagerWithTokens, dummySettingsManager)

        expect(clock.ontick).toBeDefined()
      })

      it.each([
        { viewPath: TOKENS_VIEW_PATH, shouldUseLargeTokenView: false },
        { viewPath: TOKENS_VIEW_LARGE_PATH, shouldUseLargeTokenView: true }
      ])(
        "only registers an ontick listener if not already on the correct view for view $viewPath",
        async ({ viewPath, shouldUseLargeTokenView }) => {
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView }
          })
          const someOnTickHandler = jest.fn()
          await document.location.replace(viewPath)
          clock.ontick = someOnTickHandler

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(clock.ontick).toBe(someOnTickHandler)
        }
      )

      describe("registers an ontick listener which", () => {
        it("sets the clock granularity to seconds", async () => {
          const clockMock = jest.mocked(clock)

          await updateUi(tokenManagerWithTokens, dummySettingsManager)

          expect(clockMock.granularity).toBe("seconds")
        })

        it("is set to invoke updateTokenList with the token manager", async () => {
          const dummyTickEvent = {} as TickEvent
          const updateTokenListSpy = jest
            .spyOn(tokens, "updateTokenList")
            .mockImplementation()

          await updateUi(tokenManagerWithTokens, dummySettingsManager)

          clock.ontick(dummyTickEvent)
          expect(updateTokenListSpy).toBeCalledWith(tokenManagerWithTokens)
          updateTokenListSpy.mockRestore()
        })
      })

      it.each([
        { viewPath: TOKENS_VIEW_PATH, shouldUseLargeTokenView: false },
        { viewPath: TOKENS_VIEW_LARGE_PATH, shouldUseLargeTokenView: true }
      ])(
        "does not setup the token list if already on the view $viewPath",
        async ({ viewPath, shouldUseLargeTokenView }) => {
          const settingsManager = new SettingsManager()
          settingsManager.updateSettings({
            type: "UPDATE_SETTINGS_MESSAGE",
            updatedSettings: { shouldUseLargeTokenView }
          })
          const setupTokenListSpy = jest.spyOn(tokens, "setupTokenList")
          await document.location.replace(viewPath)

          await updateUi(tokenManagerWithTokens, settingsManager)

          expect(setupTokenListSpy).not.toBeCalled()
          setupTokenListSpy.mockRestore()
        }
      )
    })

    describe("if the token manager has no tokens", () => {
      const tokenManagerWithoutTokens = new TokenManager()

      it("shows the no tokens available message", async () => {
        const documentMock = jest.mocked(document)

        await updateUi(tokenManagerWithoutTokens, dummySettingsManager)

        expect(documentMock.location.pathname).toBe(ADD_TOKENS_VIEW_PATH)
      })

      it("only changes the document location if necessary to prevent flickering", async () => {
        const replaceSpy = jest.spyOn(document.location, "replace")
        const assignSpy = jest.spyOn(document.location, "assign")

        await updateUi(tokenManagerWithoutTokens, dummySettingsManager)

        expect(replaceSpy).not.toBeCalled()
        expect(assignSpy).not.toBeCalled()
        replaceSpy.mockRestore()
        assignSpy.mockRestore()
      })

      it("clears the ontick listener", async () => {
        const clockMock = jest.mocked(clock)
        clockMock.ontick = undefined

        await updateUi(tokenManagerWithoutTokens, dummySettingsManager)

        expect(clockMock.ontick).toBeUndefined()
      })
    })

    it("invokes function to update the colors", async () => {
      const updateColorsSpy = jest.spyOn(colors, "updateColors")

      await updateUi(new TokenManager(), new SettingsManager())

      expect(updateColorsSpy).toBeCalled()
      updateColorsSpy.mockRestore()
    })
  })
})
