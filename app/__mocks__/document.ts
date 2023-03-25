export const documentMockFactory = () => {
  return {
    __esModule: true,
    default: documentMock
  }
}

interface DocumentMock {
  location: { replace: (path: string) => Promise<void> }
}

const documentMock: DocumentMock = {
  location: {
    replace: jest.fn().mockResolvedValue(undefined)
  }
}
