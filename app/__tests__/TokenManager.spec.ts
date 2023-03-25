import type { TotpConfig } from "../../common/TotpConfig"
import { TokenManager } from "../TokenManager"

describe("TokenManager", () => {
  const SOME_TOKEN: TotpConfig = {
    label: "some label",
    secret: "some secret",
    algorithm: "some algorithm",
    digits: "some digits",
    period: "some period"
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
