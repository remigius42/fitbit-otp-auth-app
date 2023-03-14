export const fsMockFactory = () => {
  return {
    __esModule: true,
    ...fsMock
  }
}

const fsMock = {
  closeSync: jest.fn(),
  existsSync: jest.fn(),
  openSync: jest.fn(),
  writeSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  writeFileSync: jest.fn()
}
