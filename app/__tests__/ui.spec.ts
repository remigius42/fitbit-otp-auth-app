import { documentMockFactory } from "../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import document from "document"
import {
  ADD_TOKENS_VIEW_PATH,
  showNoTokensAvailableMessage,
  showTokens,
  TOKENS_VIEW_PATH
} from "../ui"

describe("ui", () => {
  describe("showNoTokensAvailableMessage", () => {
    it("replaces with the correct view", async () => {
      const documentMock = jest.mocked(document)

      await showNoTokensAvailableMessage()

      expect(documentMock.location.replace).toBeCalledWith(ADD_TOKENS_VIEW_PATH)
    })
  })

  describe("showTokens", () => {
    it("replaces with the correct view", async () => {
      const documentMock = jest.mocked(document)

      await showTokens()

      expect(documentMock.location.replace).toBeCalledWith(TOKENS_VIEW_PATH)
    })
  })
})
