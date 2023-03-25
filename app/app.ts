import type { MessageEvent } from "messaging"
import { peerSocket } from "messaging"
import { PeerMessage } from "../common/PeerMessage"
import { TokenManager } from "./TokenManager"
import {
  registerDelayedMessageWhetherDeviceIsConnected,
  showNoTokensAvailableMessage,
  showTokens
} from "./ui"

const tokenManager = new TokenManager()

export function initialize() {
  registerPeerSocketListener()
  registerDelayedMessageWhetherDeviceIsConnected()
  tokenManager.registerObserver(tokensAvailableObserver)
  tokenManager.tryRestoreFromDevice()
}

function registerPeerSocketListener() {
  peerSocket.addEventListener("message", (event: MessageEvent) => {
    const message = event.data as PeerMessage
    tokenManager.handleUpdateTokensMessage(message)
  })
}

function tokensAvailableObserver(tokenManager: TokenManager) {
  if (tokenManager.getTokens().length > 0) {
    void showTokens(tokenManager)
  } else {
    void showNoTokensAvailableMessage()
  }
}
