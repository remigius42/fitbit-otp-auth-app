import { settingsMockFactory } from "../../__mocks__/settings"
jest.doMock("settings", settingsMockFactory, { virtual: true })

import { settingsStorage } from "settings"
import { signalConnected, signalDisconnected } from "../connectionStatus"
import { HAS_CONNECTION_ISSUE_SETTINGS_KEY } from "../settingsKeys"

describe("connectionStatus", () => {
  describe("signalConnected", () => {
    it("signals connectivity by clearing the connection issues setting", () => {
      const removeItemSpy = jest.spyOn(settingsStorage, "removeItem")

      signalConnected()

      expect(removeItemSpy).toBeCalledWith(HAS_CONNECTION_ISSUE_SETTINGS_KEY)
      removeItemSpy.mockRestore()
    })
  })

  describe("signalDisconnected", () => {
    it("signals no connectivity by clearing the connection issues setting", () => {
      const setItemSpy = jest.spyOn(settingsStorage, "setItem")

      signalDisconnected()

      expect(setItemSpy).toBeCalledWith(
        HAS_CONNECTION_ISSUE_SETTINGS_KEY,
        expect.anything()
      )
      setItemSpy.mockRestore()
    })
  })
})
