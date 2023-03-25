import type { MessageEvent } from "messaging"
import { peerSocket } from "messaging"
import { PeerMessage } from "../common/PeerMessage"
import { TokenManager } from "./TokenManager"
import { showNoTokensAvailableMessage, showTokens } from "./ui"

const tokenManager = new TokenManager()

export function initialize() {
  registerPeerSocketListener()
  tokenManager.registerObserver(tokensAvailableObserver)
}

function registerPeerSocketListener() {
  peerSocket.addEventListener("message", (event: MessageEvent) => {
    const message = event.data as PeerMessage
    tokenManager.handleUpdateTokensMessage(message)
  })
}

function tokensAvailableObserver() {
  if (tokenManager.getTokens().length > 0) {
    void showTokens()
  } else {
    void showNoTokensAvailableMessage()
  }
}
