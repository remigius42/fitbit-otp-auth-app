/* spell-checker:ignore MJUXILTMPEXTEWRWMNFEITY */

import { documentMockFactory } from "../../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import document from "document"
import { formatTotp, getDisplayName } from "../../../common/formatTokens"
import type { TotpConfig } from "../../../common/TotpConfig"
import { TokenManager } from "../../TokenManager"
import {
  CLOCK_SYNCHRONIZATION_MESSAGE_ID,
  DISPLAY_NAME_TEXT_ID,
  PROGRESS_ID,
  TOKEN_LIST_ID,
  TOTP_TEXT_ID
} from "../ids"
import {
  INVISIBLE_UPDATE_MARGIN,
  setupTokenList,
  showClockSynchronizationMessage,
  TokenListTileInfo,
  TOKEN_LIST_TILE_TYPE,
  updateTokenList
} from "../tokens"
import { totp } from "../../totp"

describe("tokens", () => {
  const SOME_TOKEN: TotpConfig = {
    label: "some label",
    issuer: "some issuer",
    displayName: "some displayName",
    secret: "MJUXILTMPEXTEWRWMNFEITY",
    algorithm: "SHA1",
    digits: "6",
    period: "42"
  }

  describe("setupTokenList", () => {
    it("discards previously configured tiles when called again", () => {
      const tokenManager = new TokenManager()
      injectTokensIntoTokenManager(tokenManager, [SOME_TOKEN])
      const { tokenList, firstVisibleTileSpy, lastVisibleTileSpy } =
        setupTokenListWithOneVisibleTile(tokenManager)
      const configureTileSpy = jest.spyOn(tokenList.delegate, "configureTile")
      updateTokenList(tokenManager) // should configure the single visible tile
      expect(configureTileSpy).toBeCalled()
      configureTileSpy.mockRestore()

      setupTokenList(tokenManager)

      updateTokenList(tokenManager)
      expect(configureTileSpy).not.toBeCalled()
      firstVisibleTileSpy.mockRestore()
      lastVisibleTileSpy.mockRestore()
      configureTileSpy.mockRestore()

      function setupTokenListWithOneVisibleTile(tokenManager: TokenManager) {
        const tokenList = document.getElementById(
          TOKEN_LIST_ID
        ) as VirtualTileList<TokenListTileInfo>
        const firstVisibleTileSpy = jest
          .spyOn(tokenList, "firstVisibleTile", "get")
          .mockReturnValue(0)
        const lastVisibleTileSpy = jest
          .spyOn(tokenList, "lastVisibleTile", "get")
          .mockReturnValue(1)
        const TILE_STUB = {
          getElementById: jest.fn().mockReturnValue({})
        } as unknown as VirtualTileListItem

        setupTokenList(tokenManager)
        tokenList.delegate.configureTile(TILE_STUB, {
          type: TOKEN_LIST_TILE_TYPE,
          value: { token: SOME_TOKEN, index: 0 }
        })

        return { tokenList, firstVisibleTileSpy, lastVisibleTileSpy }
      }
    })

    describe("configures a delegate which", () => {
      describe("has a getTileInfo method which", () => {
        it("returns the correct type", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate
          const SOME_INDEX = 42

          const tileInfoType = delegate.getTileInfo(SOME_INDEX).type

          expect(tileInfoType).toBe(TOKEN_LIST_TILE_TYPE)
        })

        it("returns the token in the token manager with matching index as property value", () => {
          const tokenManager = new TokenManager()
          const TEST_TOKEN_INDEX = 1
          const SOME_OTHER_TOKEN = { ...SOME_TOKEN, label: "some other token" }
          const TOKENS: Array<TotpConfig> = [SOME_OTHER_TOKEN]
          TOKENS[TEST_TOKEN_INDEX] = SOME_TOKEN
          injectTokensIntoTokenManager(tokenManager, TOKENS)
          setupTokenList(tokenManager)
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          const tileInfoValue =
            delegate.getTileInfo(TEST_TOKEN_INDEX).value.token

          expect(tileInfoValue).toStrictEqual(SOME_TOKEN)
        })
      })

      describe("has a configureTile method which", () => {
        const SOME_TILE_INDEX = 42
        const SOME_TILE_INFO: TokenListTileInfo = {
          type: TOKEN_LIST_TILE_TYPE,
          value: { token: SOME_TOKEN, index: SOME_TILE_INDEX }
        }

        it("sets the TOTP", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const totpTextSetterMock = jest.fn()
          const tileMock = setupTileMock({ totpText: totpTextSetterMock })
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          delegate.configureTile(tileMock, SOME_TILE_INFO)

          expect(totpTextSetterMock).toBeCalledWith(
            formatTotp(totp(SOME_TOKEN))
          )
        })

        it("considers the clock drift when setting the TOTP", () => {
          const SOME_CLOCK_DRIFT_IN_SECONDS = 42
          jest.useFakeTimers()
          jest.setSystemTime(0)

          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          injectTokensIntoTokenManager(
            tokenManager,
            [SOME_TOKEN],
            SOME_CLOCK_DRIFT_IN_SECONDS
          )
          const totpTextSetterMock = jest.fn()
          const tileMock = setupTileMock({ totpText: totpTextSetterMock })
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          delegate.configureTile(tileMock, SOME_TILE_INFO)

          expect(totpTextSetterMock).toBeCalledWith(
            formatTotp(totp(SOME_TOKEN, SOME_CLOCK_DRIFT_IN_SECONDS))
          )
          jest.useRealTimers()
        })

        it("sets the display name", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const displayNameTextSetterMock = jest.fn()
          const tileMock = setupTileMock({
            displayName: displayNameTextSetterMock
          })
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          delegate.configureTile(tileMock, SOME_TILE_INFO)

          expect(displayNameTextSetterMock).toBeCalledWith(
            getDisplayName(SOME_TILE_INFO.value.token)
          )
        })

        describe("displays the validity countdown by", () => {
          beforeAll(() => jest.useFakeTimers())
          afterAll(() => jest.useRealTimers())

          it.each([0, 0.1, 0.3, 0.5, 0.75, 1])(
            "setting the startAngle of the progress indicator correctly for percentage %s",
            (periodPercentage: number) => {
              const tokenManager = new TokenManager()
              setupTokenList(tokenManager)
              const startAngleSetterMock = jest.fn()
              const tileMock = setupTileMock({
                progressStartAngle: startAngleSetterMock
              })
              const delegate = (
                document.getElementById(
                  TOKEN_LIST_ID
                ) as VirtualTileList<TokenListTileInfo>
              ).delegate
              jest.setSystemTime(
                1000 *
                  Number(SOME_TILE_INFO.value.token.period) *
                  (1 + periodPercentage)
              )

              delegate.configureTile(tileMock, SOME_TILE_INFO)

              expect(startAngleSetterMock).toBeCalledWith(
                expect.closeTo((360 * periodPercentage) % 360, 4)
              )
            }
          )

          it("considers the clock drift when setting the startAngle", () => {
            const SOME_CLOCK_DRIFT_IN_SECONDS = 23
            const SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT =
              2 * SOME_CLOCK_DRIFT_IN_SECONDS * 1000
            jest.setSystemTime(SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT)
            const tokenManager = new TokenManager()
            setupTokenList(tokenManager)
            const startAngleSetterMock = jest.fn() as jest.Mock<void, [number]>
            const tileMock = setupTileMock({
              progressStartAngle: startAngleSetterMock
            })
            const delegate = (
              document.getElementById(
                TOKEN_LIST_ID
              ) as VirtualTileList<TokenListTileInfo>
            ).delegate
            delegate.configureTile(tileMock, SOME_TILE_INFO)

            // injecting the clock drift into the token manager
            injectTokensIntoTokenManager(
              tokenManager,
              [SOME_TOKEN],
              SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT / 1000 +
                SOME_CLOCK_DRIFT_IN_SECONDS
            )
            // rewinding the system time by the clock drift
            jest.setSystemTime(
              SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT -
                SOME_CLOCK_DRIFT_IN_SECONDS * 1000
            )
            delegate.configureTile(tileMock, SOME_TILE_INFO)

            expect(startAngleSetterMock).toBeCalledTimes(2)
            // since the system time offset should match the clock drift, the second startAngle should be identical to the first one
            expect(startAngleSetterMock.mock.calls[1][0]).toBe(
              startAngleSetterMock.mock.calls[0][0]
            )
          })

          it.each([0, 0.1, 0.3, 0.5, 0.75, 1])(
            "setting the sweepAngle of the progress indicator percentage %s to cover startAngle to 360",
            (periodPercentage: number) => {
              const tokenManager = new TokenManager()
              setupTokenList(tokenManager)
              const sweepAngleSetterMock = jest.fn()
              const tileMock = setupTileMock({
                progressSweepAngle: sweepAngleSetterMock
              })
              const delegate = (
                document.getElementById(
                  TOKEN_LIST_ID
                ) as VirtualTileList<TokenListTileInfo>
              ).delegate
              jest.setSystemTime(
                1000 *
                  Number(SOME_TILE_INFO.value.token.period) *
                  (1 + periodPercentage)
              )

              delegate.configureTile(tileMock, SOME_TILE_INFO)

              const expectedStartAngle = (360 * periodPercentage) % 360
              const expectedSweepAngle = 360 - expectedStartAngle
              expect(sweepAngleSetterMock).toBeCalledWith(
                expect.closeTo(expectedSweepAngle, 4)
              )
            }
          )

          it("considers the clock drift when setting the sweepAngle", () => {
            const SOME_CLOCK_DRIFT_IN_SECONDS = 23
            const SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT =
              2 * SOME_CLOCK_DRIFT_IN_SECONDS * 1000
            jest.setSystemTime(SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT)
            const tokenManager = new TokenManager()
            setupTokenList(tokenManager)
            const sweepAngleSetterMock = jest.fn() as jest.Mock<void, [number]>
            const tileMock = setupTileMock({
              progressSweepAngle: sweepAngleSetterMock
            })
            const delegate = (
              document.getElementById(
                TOKEN_LIST_ID
              ) as VirtualTileList<TokenListTileInfo>
            ).delegate
            delegate.configureTile(tileMock, SOME_TILE_INFO)

            // injecting the clock drift into the token manager
            injectTokensIntoTokenManager(
              tokenManager,
              [SOME_TOKEN],
              SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT / 1000 +
                SOME_CLOCK_DRIFT_IN_SECONDS
            )
            // rewinding the system time by the clock drift
            jest.setSystemTime(
              SOME_SYSTEM_TIME_AFTER_CLOCK_DRIFT -
                SOME_CLOCK_DRIFT_IN_SECONDS * 1000
            )
            delegate.configureTile(tileMock, SOME_TILE_INFO)

            expect(sweepAngleSetterMock).toBeCalledTimes(2)
            // since the system time offset should match the clock drift, the second sweepAngle should be identical to the first one
            expect(sweepAngleSetterMock.mock.calls[1][0]).toBe(
              sweepAngleSetterMock.mock.calls[0][0]
            )
          })
        })

        it("does not configure the tile if it doesn't have the correct type", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const totpTextSetterMock = jest.fn()
          const displayNameTextSetterMock = jest.fn()
          const tileMock = setupTileMock({
            totpText: totpTextSetterMock,
            displayName: displayNameTextSetterMock
          })
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate
          const TILE_INFO_OF_DIFFERENT_TYPE = {
            type: "some other type",
            value: "some value"
          } as unknown as TokenListTileInfo

          delegate.configureTile(tileMock, TILE_INFO_OF_DIFFERENT_TYPE)

          expect(totpTextSetterMock).not.toBeCalled()
          expect(displayNameTextSetterMock).not.toBeCalled()
        })
      })

      /* Note that `configureTile` could theoretically be invoked at any time
outside of the control of the app. Therefore it's possible that a tile gets
configured for which the app itself would not invoke `configureTile`, e.g. when
a token was deleted. This test ensures that the app does not try to render a
token for a tile which had its token deleted. */
      it("does not configure the tile if there is no token for that tile", () => {
        const tokenManager = new TokenManager()
        setupTokenList(tokenManager)
        const totpTextSetterMock = jest.fn()
        const displayNameTextSetterMock = jest.fn()
        const tileMock = setupTileMock({
          totpText: totpTextSetterMock,
          displayName: displayNameTextSetterMock
        })
        const delegate = (
          document.getElementById(
            TOKEN_LIST_ID
          ) as VirtualTileList<TokenListTileInfo>
        ).delegate
        const TILE_INFO_WITH_UNDEFINED_TOKEN = {
          type: "some other type",
          value: { index: 42, token: undefined }
        } as unknown as TokenListTileInfo

        delegate.configureTile(tileMock, TILE_INFO_WITH_UNDEFINED_TOKEN)

        expect(totpTextSetterMock).not.toBeCalled()
        expect(displayNameTextSetterMock).not.toBeCalled()
      })

      function setupTileMock(
        setterMocks: Partial<{
          totpText: jest.Mock
          displayName: jest.Mock
          progressStartAngle: jest.Mock
          progressSweepAngle: jest.Mock
        }>
      ) {
        const {
          totpText = jest.fn(),
          displayName = jest.fn(),
          progressStartAngle = jest.fn(),
          progressSweepAngle = jest.fn()
        } = setterMocks

        const totpTextMock = { text: "" }
        Object.defineProperty(totpTextMock, "text", {
          set: totpText
        })

        const displayNameTextMock = { text: "" }
        Object.defineProperty(displayNameTextMock, "text", {
          set: displayName
        })

        const progressMock = { startAngle: 0, sweepAngle: 0 }
        Object.defineProperty(progressMock, "startAngle", {
          set: progressStartAngle
        })
        Object.defineProperty(progressMock, "sweepAngle", {
          set: progressSweepAngle
        })

        const tileMock = {
          getElementById(id: string) {
            if (id === TOTP_TEXT_ID) {
              return totpTextMock
            } else if (id === DISPLAY_NAME_TEXT_ID) {
              return displayNameTextMock
            } else if (id === PROGRESS_ID) {
              return progressMock
            }
          }
        } as unknown as VirtualTileListItem

        return tileMock
      }
    })

    it("sets the list length to the number of tokens in the token manager", () => {
      const tokenManager = new TokenManager()
      const TOKENS = [SOME_TOKEN, { ...SOME_TOKEN, label: "some other label" }]
      injectTokensIntoTokenManager(tokenManager, TOKENS)

      setupTokenList(tokenManager)

      const tokenList = document.getElementById(
        TOKEN_LIST_ID
      ) as VirtualTileList<TokenListTileInfo>
      expect(tokenList.length).toBe(tokenManager.getTokens().length)
    })
  })

  describe("updateTokenList", () => {
    const NUMBER_OF_VISIBLE_TILES = 4
    const NUMBER_OF_TILES =
      NUMBER_OF_VISIBLE_TILES + 2 * INVISIBLE_UPDATE_MARGIN + 2
    const TILE_STUB = {
      getElementById: jest.fn().mockReturnValue({})
    } as unknown as VirtualTileListItem

    it("invokes configureTile for the visible tiles as well as three before and after", () => {
      const tokenManager = prepareTokenManager()
      const FIRST_VISIBLE_INDEX_AFTER_UPDATE_MARGIN = 4
      const LAST_VISIBLE_INDEX =
        FIRST_VISIBLE_INDEX_AFTER_UPDATE_MARGIN + NUMBER_OF_VISIBLE_TILES - 1
      const { configureTileSpy, firstVisibleTileSpy, lastVisibleTileSpy } =
        prepareTokenList(
          tokenManager,
          FIRST_VISIBLE_INDEX_AFTER_UPDATE_MARGIN,
          LAST_VISIBLE_INDEX
        )

      updateTokenList(tokenManager)

      expect(configureTileSpy).toBeCalledTimes(
        NUMBER_OF_VISIBLE_TILES + 2 * INVISIBLE_UPDATE_MARGIN
      )
      for (
        let i = 0;
        i < NUMBER_OF_VISIBLE_TILES + 2 * INVISIBLE_UPDATE_MARGIN;
        i++
      ) {
        const TILE_INDEX =
          i + FIRST_VISIBLE_INDEX_AFTER_UPDATE_MARGIN - INVISIBLE_UPDATE_MARGIN
        expect(configureTileSpy).toHaveBeenNthCalledWith(i + 1, TILE_STUB, {
          type: TOKEN_LIST_TILE_TYPE,
          value: {
            token: tokenManager.getTokens()[TILE_INDEX],
            index: TILE_INDEX
          }
        })
      }
      configureTileSpy.mockRestore()
      firstVisibleTileSpy.mockRestore()
      lastVisibleTileSpy.mockRestore()
    })

    it("does not extend the safety margin before the first tile when calling configureTile", () => {
      const tokenManager = prepareTokenManager()
      const FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN = 2
      expect(
        FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN - INVISIBLE_UPDATE_MARGIN
      ).toBeLessThan(0)
      const UPDATE_MARGIN_TILES_BEFORE_FIRST_TILE =
        INVISIBLE_UPDATE_MARGIN - FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN
      const LAST_VISIBLE_INDEX =
        FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN + NUMBER_OF_VISIBLE_TILES - 1
      const { configureTileSpy, firstVisibleTileSpy, lastVisibleTileSpy } =
        prepareTokenList(
          tokenManager,
          FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN,
          LAST_VISIBLE_INDEX
        )

      updateTokenList(tokenManager)

      expect(configureTileSpy).toBeCalledTimes(
        NUMBER_OF_VISIBLE_TILES +
          2 * INVISIBLE_UPDATE_MARGIN -
          UPDATE_MARGIN_TILES_BEFORE_FIRST_TILE
      )
      for (let i = 0; i < NUMBER_OF_VISIBLE_TILES; i++) {
        const TILE_INDEX =
          i +
          FIRST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN -
          INVISIBLE_UPDATE_MARGIN +
          UPDATE_MARGIN_TILES_BEFORE_FIRST_TILE
        expect(configureTileSpy).toHaveBeenNthCalledWith(i + 1, TILE_STUB, {
          type: TOKEN_LIST_TILE_TYPE,
          value: {
            token: tokenManager.getTokens()[TILE_INDEX],
            index: TILE_INDEX
          }
        })
      }
      configureTileSpy.mockRestore()
      firstVisibleTileSpy.mockRestore()
      lastVisibleTileSpy.mockRestore()
    })

    it("does not extend the safety margin after the last tile when calling configureTile", () => {
      const tokenManager = prepareTokenManager()
      const LAST_INDEX = NUMBER_OF_TILES - 1
      const LAST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN = LAST_INDEX - 2
      expect(
        LAST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN + INVISIBLE_UPDATE_MARGIN
      ).toBeGreaterThan(LAST_INDEX)
      const FIRST_VISIBLE_INDEX =
        LAST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN - NUMBER_OF_VISIBLE_TILES + 1
      const UPDATE_MARGIN_TILES_AFTER_LAST_TILE = 1
      const { configureTileSpy, firstVisibleTileSpy, lastVisibleTileSpy } =
        prepareTokenList(
          tokenManager,
          FIRST_VISIBLE_INDEX,
          LAST_VISIBLE_INDEX_WITHIN_UPDATE_MARGIN
        )

      updateTokenList(tokenManager)

      expect(configureTileSpy).toBeCalledTimes(
        NUMBER_OF_VISIBLE_TILES +
          2 * INVISIBLE_UPDATE_MARGIN -
          UPDATE_MARGIN_TILES_AFTER_LAST_TILE
      )
      for (let i = 0; i < NUMBER_OF_VISIBLE_TILES; i++) {
        const TILE_INDEX = i + FIRST_VISIBLE_INDEX - INVISIBLE_UPDATE_MARGIN
        expect(configureTileSpy).toHaveBeenNthCalledWith(i + 1, TILE_STUB, {
          type: TOKEN_LIST_TILE_TYPE,
          value: {
            token: tokenManager.getTokens()[TILE_INDEX],
            index: TILE_INDEX
          }
        })
      }
      configureTileSpy.mockRestore()
      firstVisibleTileSpy.mockRestore()
      lastVisibleTileSpy.mockRestore()
    })

    it("resizes the token list if there is a mismatch in number of tokens within the token manager", () => {
      const tokenManager = new TokenManager()
      const SOME_OTHER_TOKEN = { ...SOME_TOKEN, label: "some other label" }
      const INITIAL_TOKENS = [SOME_TOKEN]
      injectTokensIntoTokenManager(tokenManager, INITIAL_TOKENS)
      setupTokenList(tokenManager)
      const tokenList = document.getElementById(
        TOKEN_LIST_ID
      ) as VirtualTileList<TokenListTileInfo>
      expect(tokenList.length).toBe(INITIAL_TOKENS.length)
      injectTokensIntoTokenManager(tokenManager, [SOME_TOKEN, SOME_OTHER_TOKEN])
      const configureTileSpy = jest
        .spyOn(tokenList.delegate, "configureTile")
        .mockImplementation()
      const lengthSetterSpy = jest.spyOn(tokenList, "length", "set")

      updateTokenList(tokenManager)

      expect(lengthSetterSpy).toBeCalled()
      expect(tokenList.length).toBe(tokenManager.getTokens().length)
      lengthSetterSpy.mockRestore()
      configureTileSpy.mockRestore()
    })

    it("does not resize the token list if it equals the number of tokens within the token manager", () => {
      const tokenManager = new TokenManager()
      const INITIAL_TOKENS = [SOME_TOKEN]
      injectTokensIntoTokenManager(tokenManager, INITIAL_TOKENS)
      setupTokenList(tokenManager)
      const tokenList = document.getElementById(
        TOKEN_LIST_ID
      ) as VirtualTileList<TokenListTileInfo>
      expect(tokenList.length).toBe(INITIAL_TOKENS.length)
      const configureTileSpy = jest
        .spyOn(tokenList.delegate, "configureTile")
        .mockImplementation()
      const lengthSetterSpy = jest.spyOn(tokenList, "length", "set")

      updateTokenList(tokenManager)

      expect(lengthSetterSpy).not.toBeCalled()
      expect(tokenList.length).toBe(tokenManager.getTokens().length)
      lengthSetterSpy.mockRestore()
      configureTileSpy.mockRestore()
    })

    function prepareTokenManager() {
      const tokenManager = new TokenManager()
      const TOKENS: Array<TotpConfig> = []
      for (let i = 0; i < NUMBER_OF_TILES; i++) {
        TOKENS.push({ ...SOME_TOKEN, label: `some_label_${i}` })
      }
      injectTokensIntoTokenManager(tokenManager, TOKENS)

      return tokenManager
    }

    function prepareTokenList(
      tokenManager: TokenManager,
      firstVisibleTile: number,
      lastVisibleTile: number
    ) {
      setupTokenList(tokenManager)
      const tokenList = document.getElementById(
        TOKEN_LIST_ID
      ) as VirtualTileList<TokenListTileInfo>
      for (let i = 0; i < NUMBER_OF_TILES; i++) {
        tokenList.delegate.configureTile(TILE_STUB, {
          type: TOKEN_LIST_TILE_TYPE,
          value: { token: tokenManager.getTokens()[i], index: i }
        })
      }
      const configureTileSpy = jest
        .spyOn(tokenList.delegate, "configureTile")
        .mockImplementation()
      const firstVisibleTileSpy = jest
        .spyOn(tokenList, "firstVisibleTile", "get")
        .mockReturnValue(firstVisibleTile)
      const lastVisibleTileSpy = jest
        .spyOn(tokenList, "lastVisibleTile", "get")
        .mockReturnValue(lastVisibleTile)

      return { configureTileSpy, firstVisibleTileSpy, lastVisibleTileSpy }
    }
  })

  describe("showClockSynchronizationMessage", () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => {
      jest.runAllTimers()
      jest.useRealTimers()
    })

    describe("if the message element can be found and is not shown", () => {
      it("shows the message", () => {
        const getElementByIdSpy = buildDocumentSpyWithMessageElement()
        const messageElement = document.getElementById(
          CLOCK_SYNCHRONIZATION_MESSAGE_ID
        ) as GraphicsElement
        expect(messageElement.style.display).toBe("none")

        showClockSynchronizationMessage()

        expect(messageElement.style.display).toBe("inline")
        getElementByIdSpy.mockRestore()
      })

      it("triggers the message animation", () => {
        const getElementByIdSpy = buildDocumentSpyWithMessageElement()
        const messageElement = document.getElementById(
          CLOCK_SYNCHRONIZATION_MESSAGE_ID
        ) as GraphicsElement
        expect(messageElement.style.display).toBe("none")

        showClockSynchronizationMessage()

        expect(messageElement.animate).toBeCalledWith("enable")
        getElementByIdSpy.mockRestore()
      })

      it("registers a timeout which hides the element", () => {
        const getElementByIdSpy = buildDocumentSpyWithMessageElement()
        const messageElement = document.getElementById(
          CLOCK_SYNCHRONIZATION_MESSAGE_ID
        ) as GraphicsElement
        showClockSynchronizationMessage()
        expect(messageElement.style.display).toBe("inline")

        jest.advanceTimersToNextTimer()

        expect(messageElement.style.display).toBe("none")
        getElementByIdSpy.mockRestore()
      })
    })

    describe("does not register a timeout", () => {
      it("if the message element cannot be found", () => {
        const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout")

        showClockSynchronizationMessage()

        expect(setTimeoutSpy).not.toBeCalled()
        setTimeoutSpy.mockRestore()
      })

      it("the message is already being shown", () => {
        const getElementByIdSpy = buildDocumentSpyWithMessageElement()
        showClockSynchronizationMessage() // invoke before spying to show show the message
        const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout")

        showClockSynchronizationMessage()

        expect(setTimeoutSpy).not.toBeCalled()
        setTimeoutSpy.mockRestore()
        getElementByIdSpy.mockRestore()
      })
    })

    function buildDocumentSpyWithMessageElement() {
      const messageElementStub = {
        style: {
          display: "none"
        },
        animate: jest.fn()
      } as unknown as GraphicsElement
      const getElementByIdSpy = jest.spyOn(document, "getElementById")
      getElementByIdSpy.mockImplementation(id => {
        if (id === CLOCK_SYNCHRONIZATION_MESSAGE_ID) {
          return messageElementStub
        }
      })
      return getElementByIdSpy
    }
  })

  function injectTokensIntoTokenManager(
    tokenManager: TokenManager,
    tokens: Array<TotpConfig>,
    secondsSinceEpochInCompanion?: number
  ) {
    tokenManager.handleUpdateTokensMessage({
      type: "UPDATE_TOKENS_START_MESSAGE",
      count: tokens.length,
      secondsSinceEpochInCompanion
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
