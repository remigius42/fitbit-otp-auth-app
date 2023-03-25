import { documentMockFactory } from "../../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import document from "document"
import { getDisplayName } from "../../../common/formatTokens"
import type { TotpConfig } from "../../../common/TotpConfig"
import { TokenManager } from "../../TokenManager"
import { DISPLAY_NAME_TEXT_ID, TOKEN_LIST_ID, TOTP_TEXT_ID } from "../ids"
import {
  setupTokenList,
  TokenListTileInfo,
  TOKEN_LIST_TILE_TYPE
} from "../tokens"

describe("tokens", () => {
  describe("setupTokenList", () => {
    const SOME_TOKEN: TotpConfig = {
      label: "some label",
      issuer: "some issuer",
      displayName: "some displayName",
      secret: "some secret",
      algorithm: "some algorithm",
      digits: "some digits",
      period: "some period"
    }

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
          const TEST_TOKEN_INDEX = 42
          const TOKENS: Array<TotpConfig> = []
          TOKENS[TEST_TOKEN_INDEX] = SOME_TOKEN
          injectTokensIntoTokenManager(tokenManager, TOKENS)
          setupTokenList(tokenManager)
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          const tileInfoValue = delegate.getTileInfo(TEST_TOKEN_INDEX).value

          expect(tileInfoValue).toStrictEqual(SOME_TOKEN)
        })
      })

      describe("has a configureTile method which", () => {
        const SOME_TILE_INFO: TokenListTileInfo = {
          type: TOKEN_LIST_TILE_TYPE,
          value: SOME_TOKEN
        }

        it("sets the TOTP", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const totpTextSetterMock = jest.fn()
          const tileMock = setupTileMock(totpTextSetterMock, jest.fn())
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          delegate.configureTile(tileMock, SOME_TILE_INFO)

          expect(totpTextSetterMock).toBeCalledWith("1234 5678")
        })

        it("sets the display name", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const displayNameTextSetterMock = jest.fn()
          const tileMock = setupTileMock(jest.fn(), displayNameTextSetterMock)
          const delegate = (
            document.getElementById(
              TOKEN_LIST_ID
            ) as VirtualTileList<TokenListTileInfo>
          ).delegate

          delegate.configureTile(tileMock, SOME_TILE_INFO)

          expect(displayNameTextSetterMock).toBeCalledWith(
            getDisplayName(SOME_TILE_INFO.value)
          )
        })

        it("does not configure the tile if it doesn't have the correct type", () => {
          const tokenManager = new TokenManager()
          setupTokenList(tokenManager)
          const totpTextSetterMock = jest.fn()
          const displayNameTextSetterMock = jest.fn()
          const tileMock = setupTileMock(
            totpTextSetterMock,
            displayNameTextSetterMock
          )
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
        const tileMock = setupTileMock(
          totpTextSetterMock,
          displayNameTextSetterMock
        )
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
        totpTextSetterMock: jest.Mock,
        displayNameSetterMock: jest.Mock
      ) {
        const totpTextMock = { text: "" }
        Object.defineProperty(totpTextMock, "text", {
          set: totpTextSetterMock
        })

        const displayNameTextMock = { text: "" }
        Object.defineProperty(displayNameTextMock, "text", {
          set: displayNameSetterMock
        })

        const tileMock = {
          getElementById(id: string) {
            if (id === TOTP_TEXT_ID) {
              return totpTextMock
            } else if (id === DISPLAY_NAME_TEXT_ID) {
              return displayNameTextMock
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

    function injectTokensIntoTokenManager(
      tokenManager: TokenManager,
      tokens: Array<TotpConfig>
    ) {
      /* Exploiting the mutability of the returned state of tokenManager is
       * debatable, but the alternatives would be either a very convoluted
       * test or adding functionality to set its state only used for
       * testing.
       */
      tokenManager
        .getTokens()
        .splice(0, tokenManager.getTokens().length, ...tokens)
    }
  })
})
