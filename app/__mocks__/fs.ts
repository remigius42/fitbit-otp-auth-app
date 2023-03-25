export const fsMockFactory = () => {
  return {
    __esModule: true,
    ...fsMock
  }
}

const fsMock = {
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  writeFileSync: jest.fn()
}
