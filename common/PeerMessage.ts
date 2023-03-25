import { TotpConfig } from "../companion/tokens"

export interface UpdateTokensStartMessage {
  type: "UPDATE_TOKENS_START_MESSAGE"
  /** Expected number of tokens. Used to detect whether messages have been lost. */
  count: number
}

export interface UpdateTokensTokenMessage {
  type: "UPDATE_TOKENS_TOKEN_MESSAGE"
  /** Index of the token in the update sequence. Used to detect message ordering issues. */
  index: number
  token: TotpConfig
}

export interface UpdateTokensEndMessage {
  type: "UPDATE_TOKENS_END_MESSAGE"
}

export type UpdateTokensMessage =
  | UpdateTokensStartMessage
  | UpdateTokensTokenMessage
  | UpdateTokensEndMessage

export type PeerMessage = UpdateTokensMessage
