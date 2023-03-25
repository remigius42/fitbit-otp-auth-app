/* spell-checker:ignore ontick */

import clock from "clock"
import document from "document"
import { SettingsManager } from "../SettingsManager"
import { TokenManager } from "../TokenManager"
import {
  ADD_TOKENS_VIEW_PATH,
  INDEX_VIEW_PATH,
  RETRIEVING_TOKENS_CONNECTION_ISSUE_ID,
  RETRIEVING_TOKENS_ID,
  TOKENS_VIEW_LARGE_PATH,
  TOKENS_VIEW_PATH
} from "./ids"
import { setupTokenList, updateTokenList } from "./tokens"

export function registerDelayedMessageWhetherDeviceIsConnected() {
  setTimeout(() => {
    if (document.location.pathname === INDEX_VIEW_PATH) {
      ;(
        document.getElementById(RETRIEVING_TOKENS_ID) as GraphicsElement
      ).style.display = "none"
      ;(
        document.getElementById(
          RETRIEVING_TOKENS_CONNECTION_ISSUE_ID
        ) as GraphicsElement
      ).style.display = "inline"
    }
  }, 5000)
}

export async function updateUi(
  tokenManager: TokenManager,
  settingsManager: SettingsManager
) {
  if (tokenManager.getTokens().length > 0) {
    await showTokens(tokenManager, settingsManager)
  } else {
    await showNoTokensAvailableMessage()
  }
}

async function showNoTokensAvailableMessage() {
  clock.ontick = undefined
  if (document.location.pathname !== ADD_TOKENS_VIEW_PATH) {
    await document.location.replace(ADD_TOKENS_VIEW_PATH)
  }
}

async function showTokens(
  tokenManager: TokenManager,
  settingsManager: SettingsManager
) {
  const viewPath = settingsManager.getSettings().shouldUseLargeTokenView
    ? TOKENS_VIEW_LARGE_PATH
    : TOKENS_VIEW_PATH
  if (document.location.pathname !== viewPath) {
    await document.location.replace(viewPath)
    setupTokenList(tokenManager)
    setupRefreshOncePerSecond(tokenManager)
  }
}

function setupRefreshOncePerSecond(tokenManager: TokenManager) {
  clock.granularity = "seconds"
  clock.ontick = () => updateTokenList(tokenManager)
}
