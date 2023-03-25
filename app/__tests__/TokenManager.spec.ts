/* spellchecker:ignore MJUXILTMPEXTEWRWMNFEITY */

import type { TotpConfig } from "../../common/TotpConfig"
import { TokenManager } from "../TokenManager"
import * as totp from "../totp"

describe("TokenManager", () => {
  const SOME_TOKEN: TotpConfig = {
    label: "some label",
    secret: "MJUXILTMPEXTEWRWMNFEITY",
    algorithm: "SHA1",
    digits: "6",
    period: "30"
  }
  const SOME_OTHER_TOKEN: TotpConfig = {
    ...SOME_TOKEN,
    label: "some other label"
  }

  describe("handleUpdateTokensMessage", () => {
    it("updates the tokens if the update sequence is valid", () => {
      const tokenManager = new TokenManager()

      addTokensToTokenManager(tokenManager, [SOME_TOKEN, SOME_OTHER_TOKEN])

      expect(tokenManager.getTokens()).toStrictEqual([
        SOME_TOKEN,
        SOME_OTHER_TOKEN
      ])
    })

    it("triggers the observers if the update sequence is valid", () => {
      const tokenManager = new TokenManager()
      const someObserver = jest.fn()
      const someOtherObserver = jest.fn()
      tokenManager.registerObserver(someObserver)
      tokenManager.registerObserver(someOtherObserver)

      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      expect(someObserver).toBeCalled()
      expect(someOtherObserver).toBeCalled()
    })

    it("clears the tokens if the update sequence does not contain tokens", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 0
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getTokens()).toStrictEqual([])
    })

    it("discards update if token messages are received before the update is started", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index: 1,
        token: SOME_OTHER_TOKEN
      })
      // UPDATE_TOKENS_START_MESSAGE deliberately sent after the token update to simulate that they are received in a different order
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 2
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getTokens()).toStrictEqual([SOME_TOKEN])
    })

    it("discards update if the update sequence is missing entries", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 2
      })
      // update for index 0 is deliberately missing
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index: 1,
        token: SOME_OTHER_TOKEN
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getTokens()).toStrictEqual([SOME_TOKEN])
    })
  })

  describe("getTokens", () => {
    it("is the empty array at the beginning", () => {
      const tokenManager = new TokenManager()

      expect(tokenManager.getTokens()).toStrictEqual([])
    })

    it("returns the current tokens", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      expect(tokenManager.getTokens()).toStrictEqual([SOME_TOKEN])
    })

    it("does not return tokens which are part of an ongoing update sequence", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 1
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index: 0,
        token: SOME_OTHER_TOKEN
      })

      expect(tokenManager.getTokens()).toStrictEqual([SOME_TOKEN])
    })
  })

  describe("registerObserver", () => {
    it("adds observers", () => {
      const tokenManager = new TokenManager()
      const someObserver = () => "do something"
      tokenManager.registerObserver(someObserver)
      const someOtherObserver = () => "do something else"

      tokenManager.registerObserver(someOtherObserver)

      expect(tokenManager.getObservers()).toStrictEqual([
        someObserver,
        someOtherObserver
      ])
    })
  })

  describe("getObservers", () => {
    it("returns the currently registered observers", () => {
      const tokenManager = new TokenManager()
      const someObserver = () => "do something"
      tokenManager.registerObserver(someObserver)

      expect(tokenManager.getObservers()).toStrictEqual([someObserver])
    })
  })

  describe("getPassword", () => {
    beforeAll(() => jest.useFakeTimers())
    beforeEach(() => jest.setSystemTime(0))
    afterAll(() => jest.useRealTimers())

    it("only calculates the TOTP once per period", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])
      const totpSpy = jest.spyOn(totp, "totp")
      tokenManager.getPassword(SOME_TOKEN)
      const period = Number(SOME_TOKEN.period)

      for (let i = 0; i < period * 1000; i += 1000) {
        tokenManager.getPassword(SOME_TOKEN)
        jest.advanceTimersByTime(1000)
      }

      expect(totpSpy).toBeCalledTimes(1)
      totpSpy.mockRestore()
    })

    it("returns the same TOTP as if the TOTP is calculated manually", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      const tokenManagerTotp = tokenManager.getPassword(SOME_TOKEN)

      const expectedTotp = totp.totp(SOME_TOKEN)
      expect(tokenManagerTotp).toBe(expectedTotp)
    })
  })

  describe("features a password cache which", () => {
    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(0)
    })
    afterAll(() => jest.useRealTimers())

    it("does return the correct passwords if two configurations share the same label but different issuers", () => {
      const tokenManager = new TokenManager()
      const TOKEN_ISSUER_FOO = { ...SOME_TOKEN, issuer: "foo" }
      const TOKEN_ISSUER_BAR = { ...TOKEN_ISSUER_FOO, issuer: "bar" }
      addTokensToTokenManager(tokenManager, [
        TOKEN_ISSUER_FOO,
        TOKEN_ISSUER_BAR
      ])

      const tokenIssuerFooTotp = tokenManager.getPassword(TOKEN_ISSUER_FOO)
      const tokenIssuerBarTotp = tokenManager.getPassword(TOKEN_ISSUER_BAR)

      const expectedTokenIssuerFooTotp = totp.totp(TOKEN_ISSUER_FOO)
      const expectedTokenIssuerBarTotp = totp.totp(TOKEN_ISSUER_BAR)
      expect(tokenIssuerFooTotp).toBe(expectedTokenIssuerFooTotp)
      expect(tokenIssuerBarTotp).toBe(expectedTokenIssuerBarTotp)
    })

    it("does return the correct passwords if two configurations share the same label but only one has an issuer", () => {
      const tokenManager = new TokenManager()
      const TOKEN_ISSUER_FOO = { ...SOME_TOKEN, issuer: "foo" }
      const TOKEN_WITHOUT_ISSUER = { ...TOKEN_ISSUER_FOO, issuer: undefined }
      addTokensToTokenManager(tokenManager, [
        TOKEN_ISSUER_FOO,
        TOKEN_WITHOUT_ISSUER
      ])

      const tokenIssuerFooTotp = tokenManager.getPassword(TOKEN_ISSUER_FOO)
      const tokenWithoutIssuerTotp =
        tokenManager.getPassword(TOKEN_WITHOUT_ISSUER)

      const expectedTokenIssuerFooTotp = totp.totp(TOKEN_ISSUER_FOO)
      const expectedTokenWithoutIssuerTotp = totp.totp(TOKEN_WITHOUT_ISSUER)
      expect(tokenIssuerFooTotp).toBe(expectedTokenIssuerFooTotp)
      expect(tokenWithoutIssuerTotp).toBe(expectedTokenWithoutIssuerTotp)
    })

    // test by advancing one period and checking if `totp` has to be called again after winding the time back to the previous period
    it("clears the previous cached password if the password for a new period is set", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])
      const totpSpy = jest.spyOn(totp, "totp")
      tokenManager.getPassword(SOME_TOKEN)
      expect(totpSpy).toBeCalledTimes(1)
      const period = Number(SOME_TOKEN.period)
      jest.advanceTimersByTime(period * 1000) // advance to next period
      tokenManager.getPassword(SOME_TOKEN)
      expect(totpSpy).toBeCalledTimes(2)
      jest.setSystemTime(0) // reset to previous period

      tokenManager.getPassword(SOME_TOKEN)

      expect(totpSpy).toBeCalledTimes(3)
      totpSpy.mockRestore()
    })
  })

  function addTokensToTokenManager(
    tokenManager: TokenManager,
    tokens: Array<TotpConfig>
  ) {
    tokenManager.handleUpdateTokensMessage({
      type: "UPDATE_TOKENS_START_MESSAGE",
      count: tokens.length
    })

    tokens.forEach((token, index) =>
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_TOKEN_MESSAGE",
        index,
        token
      })
    )

    tokenManager.handleUpdateTokensMessage({
      type: "UPDATE_TOKENS_END_MESSAGE"
    })
  }
})
