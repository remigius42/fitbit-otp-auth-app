import document from "document"
import {
  ADD_TOKENS_VIEW_PATH,
  INDEX_VIEW_PATH,
  RETRIEVING_TOKENS_CONNECTION_ISSUE_ID,
  RETRIEVING_TOKENS_ID,
  TOKENS_VIEW_PATH
} from "./ids"

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

export async function showNoTokensAvailableMessage() {
  await document.location.replace(ADD_TOKENS_VIEW_PATH)
}

export async function showTokens() {
  await document.location.replace(TOKENS_VIEW_PATH)
}
