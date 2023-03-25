export const messagingMockFactory = () => {
  return {
    __esModule: true,
    peerSocket: peerSocketMock,
    MessageEvent: jest.fn()
  }
}

enum peerSocketMockReadyState {
  "OPEN",
  "CLOSED"
}

type EventListener = (event: { type: string }) => void
type MessageEventListeners = (data: object) => void

export interface PeerSocketMock {
  OPEN: peerSocketMockReadyState.OPEN
  CLOSED: peerSocketMockReadyState.CLOSED
  addEventListener: (eventName: string, listener: EventListener) => void
  openEventListeners: Array<EventListener>
  closeEventListeners: Array<EventListener>
  messageEventListeners: Array<MessageEventListeners>
  openSocket: () => void
  closeSocket: () => void
  mockReset: () => void
  readyState: peerSocketMockReadyState
  receive: (message: { data: object }) => void
  send: (data: string) => void
}

const peerSocketMock: PeerSocketMock = {
  addEventListener(
    this: PeerSocketMock,
    eventName: string,
    listener: EventListener
  ) {
    if (eventName === "open") {
      this.openEventListeners.push(listener)
    } else if (eventName === "close") {
      this.closeEventListeners.push(listener)
    } else if (eventName === "message") {
      this.messageEventListeners.push(listener)
    }
  },
  CLOSED: peerSocketMockReadyState.CLOSED,
  OPEN: peerSocketMockReadyState.OPEN,
  openEventListeners: [],
  closeEventListeners: [],
  openSocket(this: PeerSocketMock) {
    this.readyState = peerSocketMockReadyState.OPEN
    this.openEventListeners.forEach(listener =>
      listener({ type: "some event type" })
    )
  },
  closeSocket(this: PeerSocketMock) {
    this.readyState = peerSocketMockReadyState.CLOSED
    this.closeEventListeners.forEach(listener =>
      listener({ type: "some event type" })
    )
  },
  messageEventListeners: [],
  mockReset(this: PeerSocketMock) {
    this.readyState = peerSocketMockReadyState.CLOSED
    this.openEventListeners = []
    this.messageEventListeners = []
  },
  readyState: peerSocketMockReadyState.CLOSED,
  receive(this: PeerSocketMock, data: object) {
    this.messageEventListeners.forEach(listener => listener(data))
  },
  send: jest.fn()
}
