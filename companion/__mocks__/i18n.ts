export const i18nMockFactory = () => {
  return {
    gettext: identityGettextMock
  }
}

const identityGettextMock = jest.fn((msgid: string) => msgid)
