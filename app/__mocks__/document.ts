import {
  INDEX_VIEW_PATH,
  RETRIEVING_TOKENS_CONNECTION_ISSUE_ID,
  RETRIEVING_TOKENS_ID,
  TOKEN_LIST_ID
} from "../ui/ids"

export const documentMockFactory = () => {
  return {
    __esModule: true,
    default: documentMock
  }
}

interface GraphicsElement {
  style: {
    display: string
  }
}

interface DocumentMock {
  elements: Record<string, GraphicsElement>
  getElementById: (id: string) => GraphicsElement | undefined
  location: { replace: (path: string) => Promise<void>; pathname: string }
}

const documentMock: DocumentMock = {
  elements: {
    [RETRIEVING_TOKENS_ID]: {
      style: {
        display: "inline"
      }
    },
    [RETRIEVING_TOKENS_CONNECTION_ISSUE_ID]: {
      style: {
        display: "none"
      }
    },
    [TOKEN_LIST_ID]: {
      style: {
        display: "inline"
      }
    }
  },
  getElementById(this: DocumentMock, id) {
    return this.elements[id]
  },
  location: {
    pathname: INDEX_VIEW_PATH,
    replace(this: DocumentMock["location"], path: string) {
      this.pathname = path
      return Promise.resolve()
    }
  }
}
