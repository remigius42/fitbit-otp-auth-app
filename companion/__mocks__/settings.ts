export const settingsMockFactory = () => {
  return {
    __esModule: true,
    settingsStorage: settingsStorageMock
  }
}

const settingsStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  addEventListener: jest.fn()
}
