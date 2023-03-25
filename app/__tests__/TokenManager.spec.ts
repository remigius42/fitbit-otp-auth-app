/* spellchecker:ignore MJUXILTMPEXTEWRWMNFEITY, cbor */

import { fsMockFactory } from "../__mocks__/fs"
jest.doMock("fs", fsMockFactory, { virtual: true })

import * as fs from "fs"
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

  beforeEach(() => {
    jest.clearAllMocks()
    const fsMock = jest.mocked(fs)
    fsMock.existsSync.mockImplementation((filename: string) =>
      filename === TokenManager.TOKENS_CBOR_PATH ? true : false
    )
  })

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

    it("defaults to a clock drift of 0 if the secondsSinceEpochInCompanion is not provided", () => {
      const tokenManager = new TokenManager()

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 0
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getClockDrift()).toBe(0)
    })

    it("sets the clock drift as the difference in seconds since epoch between companion and device", () => {
      const SECONDS_SINCE_EPOCH_IN_COMPANION = 42
      const SECONDS_SINCE_EPOCH_IN_DEVICE = 23
      jest.useFakeTimers()
      jest.setSystemTime(SECONDS_SINCE_EPOCH_IN_DEVICE * 1000)
      const tokenManager = new TokenManager()

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 0,
        secondsSinceEpochInCompanion: SECONDS_SINCE_EPOCH_IN_COMPANION
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getClockDrift()).toBe(
        SECONDS_SINCE_EPOCH_IN_COMPANION - SECONDS_SINCE_EPOCH_IN_DEVICE
      )
      jest.useRealTimers()
    })

    it("ignores the new clock drift if the update sequence is invalid", () => {
      const SECONDS_SINCE_EPOCH_IN_COMPANION = 42
      const SECONDS_SINCE_EPOCH_IN_DEVICE = 23
      jest.useFakeTimers()
      jest.setSystemTime(SECONDS_SINCE_EPOCH_IN_DEVICE * 1000)
      const tokenManager = new TokenManager()

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 1, // corrupt update sequence by setting expected tokens to 1 while providing none.
        secondsSinceEpochInCompanion: SECONDS_SINCE_EPOCH_IN_COMPANION
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getClockDrift()).toBe(0)
      jest.useRealTimers()
    })

    it("stores the tokens if the update sequence is valid and storing tokens on the device is enabled", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      const ENABLE_STORE_ON_DEVICE = true
      const tokenManager = new TokenManager()
      const fsMock = jest.mocked(fs)

      addTokensToTokenManager(
        tokenManager,
        [SOME_TOKEN, SOME_OTHER_TOKEN],
        SOME_SECONDS_SINCE_EPOCH,
        ENABLE_STORE_ON_DEVICE
      )

      expect(fsMock.writeFileSync).toBeCalledWith(
        TokenManager.TOKENS_CBOR_PATH,
        tokenManager.getTokens(),
        "cbor"
      )
    })

    it("does not store the tokens if the update sequence is invalid, even if setting is enabled", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      const tokenManager = new TokenManager()
      const fsMock = jest.mocked(fs)

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 1, // corrupt update sequence by setting expected tokens to 1 while providing none.
        secondsSinceEpochInCompanion: SOME_SECONDS_SINCE_EPOCH,
        storeTokensOnDevice: true
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(fsMock.writeFileSync).not.toBeCalled()
    })

    it("deletes the tokens on the device when the setting is disabled", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      const IS_STORING_TOKENS = false
      const tokenManager = new TokenManager()
      const fsMock = jest.mocked(fs)

      addTokensToTokenManager(
        tokenManager,
        [SOME_TOKEN, SOME_OTHER_TOKEN],
        SOME_SECONDS_SINCE_EPOCH,
        IS_STORING_TOKENS
      )

      expect(fsMock.unlinkSync).toBeCalledWith(TokenManager.TOKENS_CBOR_PATH)
    })

    it("ignores the update sequence validity when instructed to delete the tokens on the device", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      const tokenManager = new TokenManager()
      const fsMock = jest.mocked(fs)

      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 1, // corrupt update sequence by setting expected tokens to 1 while providing none.
        secondsSinceEpochInCompanion: SOME_SECONDS_SINCE_EPOCH
        // for security reasons, the tokens are only stored on the device when explicitly instructed to, therefore omitting `storeTokensOnDevice` triggers a deletion like `storeTokensOnDevice: false` would
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(fsMock.unlinkSync).toBeCalled()
    })

    it("does not try to delete the tokens on the device if the file does not exist", () => {
      const SOME_SECONDS_SINCE_EPOCH = 42
      const IS_STORING_TOKENS = false
      const tokenManager = new TokenManager()
      const fsMock = jest.mocked(fs)
      fsMock.existsSync.mockImplementation((filename: string) =>
        filename === TokenManager.TOKENS_CBOR_PATH ? false : true
      )

      addTokensToTokenManager(
        tokenManager,
        [SOME_TOKEN, SOME_OTHER_TOKEN],
        SOME_SECONDS_SINCE_EPOCH,
        IS_STORING_TOKENS
      )

      expect(fsMock.unlinkSync).not.toBeCalled()
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

    it("only calculates the current TOTP once per period", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])
      const totpSpy = jest.spyOn(totp, "totp")
      tokenManager.getPassword(SOME_TOKEN)
      const period = Number(SOME_TOKEN.period)

      for (let i = 0; i < period * 1000; i += 1000) {
        tokenManager.getPassword(SOME_TOKEN)
        jest.advanceTimersByTime(1000)
      }

      expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
      totpSpy.mockRestore()
    })

    it("returns the same TOTP as if the TOTP is calculated manually", () => {
      const tokenManager = new TokenManager()
      addTokensToTokenManager(tokenManager, [SOME_TOKEN])

      const tokenManagerTotp = tokenManager.getPassword(SOME_TOKEN)

      const expectedTotp = totp.totp(SOME_TOKEN)
      expect(tokenManagerTotp).toBe(expectedTotp)
    })

    it("considers the clock drift", () => {
      const tokenManager = new TokenManager()
      const SOME_CLOCK_DRIFT = 42
      addTokensToTokenManager(tokenManager, [SOME_TOKEN], SOME_CLOCK_DRIFT)

      const tokenManagerTotp = tokenManager.getPassword(SOME_TOKEN)

      const expectedTotp = totp.totp(SOME_TOKEN, SOME_CLOCK_DRIFT)
      expect(tokenManagerTotp).toBe(expectedTotp)
    })

    it("does not return undefined if the clock drift compensation shifts the current period", () => {
      //      d5a41348ad612422057fb598aaf58cd130c9b7cb
      const MORE_THAN_PERIOD_SECONDS = Number(SOME_TOKEN.period) * 2
      let now = 0
      jest
        .spyOn(Date, "now")
        .mockImplementation(() => (now += MORE_THAN_PERIOD_SECONDS * 1000))
      const tokenManager = new TokenManager()
      const SOME_CLOCK_DRIFT = 42
      addTokensToTokenManager(tokenManager, [SOME_TOKEN], SOME_CLOCK_DRIFT)

      const tokenManagerTotp = tokenManager.getPassword(SOME_TOKEN)

      expect(tokenManagerTotp).toBeDefined()
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
      expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
      const period = Number(SOME_TOKEN.period)
      jest.advanceTimersByTime(period * 1000) // advance to next period
      tokenManager.getPassword(SOME_TOKEN) // call not asserted since it might have been pre-cached, instead clearing the spy
      totpSpy.mockClear()
      jest.setSystemTime(0) // reset to previous period

      tokenManager.getPassword(SOME_TOKEN)

      expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
      totpSpy.mockRestore()
    })

    describe("randomly pre-caches the next password while", () => {
      let randomSpy: jest.SpyInstance
      beforeAll(() => {
        randomSpy = jest.spyOn(Math, "random").mockReturnValue(0) // since the comparison in the cache is `Math.random() < threshold` this will always trigger the pre-caching.
      })
      afterAll(() => randomSpy.mockRestore())

      it("the pre-cached password matches the one which is manually calculated", () => {
        const tokenManager = new TokenManager()
        addTokensToTokenManager(tokenManager, [SOME_TOKEN])
        const totpSpy = jest.spyOn(totp, "totp")
        tokenManager.getPassword(SOME_TOKEN)
        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)
        totpSpy.mockClear()

        const period = Number(SOME_TOKEN.period)
        jest.advanceTimersByTime(period * 1000)
        const preCachedPassword = tokenManager.getPassword(SOME_TOKEN)
        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(0) // assert the password was pre-cached

        tokenManager.getPassword(SOME_TOKEN)

        expect(preCachedPassword).toBe(totp.totp(SOME_TOKEN))
        totpSpy.mockRestore()
      })

      it("calculating the next password only once", () => {
        const tokenManager = new TokenManager()
        addTokensToTokenManager(tokenManager, [SOME_TOKEN])
        const totpSpy = jest.spyOn(totp, "totp")
        tokenManager.getPassword(SOME_TOKEN)
        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)

        tokenManager.getPassword(SOME_TOKEN)

        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)
        totpSpy.mockRestore()
      })

      it("preserving the current password", () => {
        const tokenManager = new TokenManager()
        addTokensToTokenManager(tokenManager, [SOME_TOKEN])
        const totpSpy = jest.spyOn(totp, "totp")
        tokenManager.getPassword(SOME_TOKEN)
        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)

        tokenManager.getPassword(SOME_TOKEN)

        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        totpSpy.mockRestore()
      })

      // test by moving two periods ahead, which should yield two calls: one to calculate the current password and another which pre-caches the next (because Math.random() is overridden)
      it("not keeping more than the current and the next password", () => {
        const tokenManager = new TokenManager()
        addTokensToTokenManager(tokenManager, [SOME_TOKEN])
        const totpSpy = jest.spyOn(totp, "totp")
        tokenManager.getPassword(SOME_TOKEN)
        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)
        totpSpy.mockClear()
        const period = Number(SOME_TOKEN.period)
        jest.advanceTimersByTime(2 * period * 1000)

        tokenManager.getPassword(SOME_TOKEN)

        expect(getTotpInvocationsForCurrentPeriod(totpSpy)).toBe(1)
        expect(getTotpInvocationsForNextPeriod(totpSpy)).toBe(1)
        expect(totpSpy).toBeCalledTimes(2)
        totpSpy.mockRestore()
      })
    })
  })

  describe("getClockDrift", () => {
    it("returns the clock drift of the latest valid update sequence", () => {
      const SECONDS_SINCE_EPOCH_IN_COMPANION = 42
      const SOME_OTHER_SECONDS_SINCE_EPOCH_IN_COMPANION = 123
      const SECONDS_SINCE_EPOCH_IN_DEVICE = 23
      jest.useFakeTimers()
      jest.setSystemTime(SECONDS_SINCE_EPOCH_IN_DEVICE * 1000)
      const tokenManager = new TokenManager()
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 0,
        secondsSinceEpochInCompanion: SECONDS_SINCE_EPOCH_IN_COMPANION
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      // send invalid sequence trying to update `secondsSinceEpochInCompanion`
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_START_MESSAGE",
        count: 1, // corrupt update sequence by setting expected tokens to 1 while providing none.
        secondsSinceEpochInCompanion:
          SOME_OTHER_SECONDS_SINCE_EPOCH_IN_COMPANION
      })
      tokenManager.handleUpdateTokensMessage({
        type: "UPDATE_TOKENS_END_MESSAGE"
      })

      expect(tokenManager.getClockDrift()).toBe(
        SECONDS_SINCE_EPOCH_IN_COMPANION - SECONDS_SINCE_EPOCH_IN_DEVICE
      )
      jest.useRealTimers()
    })
  })

  function addTokensToTokenManager(
    tokenManager: TokenManager,
    tokens: Array<TotpConfig>,
    secondsSinceEpochInCompanion?: number,
    storeTokensOnDevice?: boolean
  ) {
    tokenManager.handleUpdateTokensMessage({
      type: "UPDATE_TOKENS_START_MESSAGE",
      count: tokens.length,
      secondsSinceEpochInCompanion,
      storeTokensOnDevice
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

  function getTotpInvocationsForCurrentPeriod(
    totpSpy: jest.SpyInstance<string, [TotpConfig, number?, boolean?]>
  ) {
    return totpSpy.mock.calls.filter(
      ([, , isForNextPeriod]) => isForNextPeriod === undefined
    ).length
  }

  function getTotpInvocationsForNextPeriod(
    totpSpy: jest.SpyInstance<string, [TotpConfig, number?, boolean?]>
  ) {
    return totpSpy.mock.calls.filter(
      ([, , isForNextPeriod]) => isForNextPeriod === true
    ).length
  }
})
