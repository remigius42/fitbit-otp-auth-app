import type { MessageEvent } from "messaging"
import { peerSocket } from "messaging"
import { PeerMessage } from "../common/PeerMessage"
import { log, outputLog } from "./debug_log"
import { SettingsManager } from "./SettingsManager"
import { TokenManager } from "./TokenManager"
import { registerDelayedMessageWhetherDeviceIsConnected, updateUi } from "./ui"
import { updateColors } from "./ui/colors"
import { showClockSynchronizationMessage } from "./ui/tokens"

const tokenManager = new TokenManager()
const settingsManager = new SettingsManager()

export function initialize() {
  log("App started...")
  registerPeerSocketListener()
  registerDelayedMessageWhetherDeviceIsConnected()
  settingsManager.registerObserver(
    (settingsManager: SettingsManager) =>
      void updateUi(tokenManager, settingsManager)
  )
  settingsManager.restoreSettings()
  updateColors(settingsManager)
  tokenManager.registerObserver(
    (tokenManager: TokenManager) => void updateUi(tokenManager, settingsManager)
  )
  tokenManager.registerObserver((_, wasClockDriftChanged) => {
    if (wasClockDriftChanged) {
      showClockSynchronizationMessage()
    }
  })
  tokenManager.tryRestoreFromDevice()
  log("Startup complete.")
}

function registerPeerSocketListener() {
  peerSocket.addEventListener("message", (event: MessageEvent) => {
    const message = event.data as PeerMessage
    switch (message.type) {
      case "UPDATE_TOKENS_START_MESSAGE":
      case "UPDATE_TOKENS_TOKEN_MESSAGE":
      case "UPDATE_TOKENS_END_MESSAGE":
        tokenManager.handleUpdateTokensMessage(message)
        break
      case "UPDATE_SETTINGS_MESSAGE":
        settingsManager.updateSettings(message)
        outputLog()
        break
      /* istanbul ignore next: this is only the compile time exhaustiveness check (see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) */
      default:
        // eslint-disable-next-line no-case-declarations
        const _exhaustiveCheck: never = message
        return _exhaustiveCheck
    }
  })
}
