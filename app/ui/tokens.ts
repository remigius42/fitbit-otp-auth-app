import document from "document"
import { formatTotp, getDisplayName } from "../../common/formatTokens"
import type { TotpConfig } from "../../common/TotpConfig"
import { TokenManager } from "../TokenManager"
import { DISPLAY_NAME_TEXT_ID, TOKEN_LIST_ID, TOTP_TEXT_ID } from "./ids"

export interface TokenListTileInfo {
  type: typeof TOKEN_LIST_TILE_TYPE
  value: TotpConfig
}

export const TOKEN_LIST_TILE_TYPE = "token-list-item-pool"

export function setupTokenList(tokenManager: TokenManager) {
  const tokenList = document.getElementById(
    TOKEN_LIST_ID
  ) as VirtualTileList<TokenListTileInfo>

  tokenList.delegate = {
    getTileInfo: (index: number): TokenListTileInfo => {
      return {
        type: TOKEN_LIST_TILE_TYPE,
        value: tokenManager.getTokens()[index]
      }
    },
    configureTile: (tile, info: TokenListTileInfo) => {
      if (info.type === TOKEN_LIST_TILE_TYPE) {
        const token = info.value

        if (token) {
          tile.getElementById(TOTP_TEXT_ID).text = formatTotp("12345678")
          tile.getElementById(DISPLAY_NAME_TEXT_ID).text = getDisplayName(token)
        }
      }
    }
  }

  tokenList.length = tokenManager.getTokens().length
}
