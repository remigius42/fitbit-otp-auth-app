import type {
  UpdateTokensMessage,
  UpdateTokensStartMessage,
  UpdateTokensTokenMessage
} from "../common/PeerMessage"
import type { TotpConfig } from "../common/TotpConfig"
import { currentPeriod, totp } from "./totp"

type TokenManagerObserver = (tokenManager: TokenManager) => void

export class TokenManager {
  private readonly tokens: Array<TotpConfig> = []
  private readonly updateTokensBuffer = new UpdateTokensBuffer()
  private readonly observers: Array<TokenManagerObserver> = []
  private readonly passwordCache = new TokenPasswordCache()

  handleUpdateTokensMessage(message: UpdateTokensMessage) {
    switch (message.type) {
      case "UPDATE_TOKENS_START_MESSAGE":
        this.updateTokensBuffer.handleStartMessage(message)
        break
      case "UPDATE_TOKENS_TOKEN_MESSAGE":
        this.updateTokensBuffer.handleTokenMessage(message)
        break
      case "UPDATE_TOKENS_END_MESSAGE":
        this.updateTokensBuffer.handleEndMessage()
        if (this.updateTokensBuffer.wasUpdateSuccessful()) {
          this.updateTokens()
          this.notifyObservers()
        }
        break
      /* istanbul ignore next: this is only the compile time exhaustiveness check (see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) */
      default:
        // eslint-disable-next-line no-case-declarations
        const _exhaustiveCheck: never = message
        return _exhaustiveCheck
    }
  }

  getTokens() {
    return this.tokens
  }

  registerObserver(observer: TokenManagerObserver) {
    this.observers.push(observer)
  }

  getObservers() {
    return this.observers
  }

  getPassword(totpConfig: TotpConfig) {
    return this.passwordCache.getPassword(totpConfig)
  }

  private updateTokens() {
    this.tokens.length = 0
    this.updateTokensBuffer
      .getTokens()
      .forEach(token => this.tokens.push(token))
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this))
  }
}

class UpdateTokensBuffer {
  private expectedCount = 0
  private readonly tokens: Array<TotpConfig> = []
  private updateSuccessful = false
  private hasUpdateStarted = false

  handleStartMessage(message: UpdateTokensStartMessage) {
    this.expectedCount = message.count
    this.tokens.length = 0
    this.updateSuccessful = false
    this.hasUpdateStarted = true
  }

  handleTokenMessage(message: UpdateTokensTokenMessage) {
    if (this.hasUpdateStarted) {
      this.tokens[message.index] = message.token
    } else {
      this.abortUpdate()
    }
  }

  handleEndMessage() {
    const numberOfReceivedTokens = this.tokens.filter(
      token => token !== undefined
    ).length

    /* Note that checking the number of received tokens upon receiving an "end
message", while necessary with the current implementation to ensure consistency
(for example to detect overlapping update sequences), can lead to rejected
update sequences and therefore a stale configuration on the smartwatch. With the
Bluetooth connection between smartphone and smartwatch, messages can be received
in a different sequence than they have been sent in, thus an "end message"
received before still pending "token messages" can disrupt an update. */
    if (
      this.hasUpdateStarted &&
      numberOfReceivedTokens === this.expectedCount
    ) {
      this.updateSuccessful = true
    } else {
      this.abortUpdate()
    }
    this.hasUpdateStarted = false
  }

  wasUpdateSuccessful() {
    return this.updateSuccessful
  }

  getTokens() {
    return this.tokens
  }

  private abortUpdate() {
    this.updateSuccessful = false
    this.hasUpdateStarted = false
    this.tokens.length = 0
  }
}

class TokenPasswordCache {
  /**
   * Cache is structured as follows: issuer -\> label -\> period -\> password
   *
   * Since `Map` has been added with ECMAScript 6 it's not available and joining
   * the `label` and the `issuer` into a string to simplify the data structure
   * might lead to collisions.
   */
  private readonly cache: Record<
    string,
    Record<string, Record<number, string>>
  > = {}

  getPassword(totpConfig: TotpConfig) {
    const { issuer, label, period: periodString } = totpConfig
    this.ensureIssuerAndLabelAreRegistered(issuer, label)
    const period = Number(periodString)
    const currentPeriodIndex = currentPeriod(period)
    if (!this.cache[issuer][label][currentPeriodIndex]) {
      this.cache[issuer][label] = { [currentPeriodIndex]: totp(totpConfig) }
    }
    return this.cache[issuer][label][currentPeriodIndex]
  }

  private ensureIssuerAndLabelAreRegistered(issuer: string, label: string) {
    if (!this.cache[issuer]) {
      this.cache[issuer] = {}
    }
    if (!this.cache[issuer][label]) {
      this.cache[issuer][label] = {}
    }
  }
}
