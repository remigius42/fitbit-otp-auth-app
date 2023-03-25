import document from "document"

export const ADD_TOKENS_VIEW_PATH = "./resources/add_tokens.view"
export const TOKENS_VIEW_PATH = "./resources/tokens.view"

export async function showNoTokensAvailableMessage() {
  await document.location.replace(ADD_TOKENS_VIEW_PATH)
}

export async function showTokens() {
  await document.location.replace(TOKENS_VIEW_PATH)
}
