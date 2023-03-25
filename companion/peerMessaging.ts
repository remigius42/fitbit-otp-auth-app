import * as messaging from "messaging"
import { settingsStorage } from "settings"
import { PeerMessage } from "../common/PeerMessage"
import type { TotpConfig } from "../common/TotpConfig"
import { TOKENS_SETTINGS_KEY } from "./tokens"

export function sendTokensWhenDeviceIsReady() {
  messaging.peerSocket.addEventListener("open", () => {
    const currentStringifiedTokens =
      settingsStorage.getItem(TOKENS_SETTINGS_KEY)
    sendTokensToDevice(
      currentStringifiedTokens
        ? (JSON.parse(currentStringifiedTokens) as Array<TotpConfig>)
        : []
    )
  })
}

/**
 * Send the changed tokens to the device.
 *
 * Note that the `peerSocket` has a `MAX_MESSAGE_SIZE` and the application layer
 * has to make sure to fragment messages as necessary, which is why the tokens
 * are transmitted individually (on the simulator the limit was 1027 bytes which
 * should be enough for a single token).
 *
 * See
 * {@link https://dev.fitbit.com/build/reference/companion-api/messaging/#send-}
 * for further details.
 */
export function sendTokensToDevice(tokens: Array<TotpConfig>) {
  sendMessageToDevice({
    type: "UPDATE_TOKENS_START_MESSAGE",
    count: tokens.length,
    secondsSinceEpochInCompanion: Date.now() / 1000
  })

  tokens.forEach((token, index) =>
    sendMessageToDevice({ type: "UPDATE_TOKENS_TOKEN_MESSAGE", index, token })
  )

  sendMessageToDevice({ type: "UPDATE_TOKENS_END_MESSAGE" })
}

function sendMessageToDevice(message: PeerMessage) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(message)
  }
}
