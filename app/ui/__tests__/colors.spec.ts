import { documentMockFactory } from "../../__mocks__/document"
jest.doMock("document", documentMockFactory, { virtual: true })

import { fsMockFactory } from "../../__mocks__/fs"
jest.doMock("fs", fsMockFactory, { virtual: true })

import document from "document"
import { ColorSchemeName, ColorSchemes } from "../../../common/ColorSchemes"
import { SettingsManager } from "../../SettingsManager"
import { updateColors } from "../colors"
import { ROOT_ID } from "../ids"

describe("colors", () => {
  describe("updateColors", () => {
    const ELEMENTS_WITH_CLASS_BACKGROUND_FILL =
      generateElementsForClassName("background-fill")
    const ELEMENTS_WITH_CLASS_APPLICATION_FILL =
      generateElementsForClassName("application-fill")
    const ELEMENTS_WITH_CLASS_TOKEN_SEPARATOR_FILL =
      generateElementsForClassName("token-separator")
    const ELEMENTS_WITH_CLASS_PROGRESS_BACKGROUND_FILL =
      generateElementsForClassName("progress-background")

    beforeEach(() => {
      jest.resetAllMocks()
      jest
        .spyOn(document, "getElementsByClassName")
        .mockImplementation((className: string) => {
          switch (className) {
            case "background-fill":
              return ELEMENTS_WITH_CLASS_BACKGROUND_FILL
            case "application-fill":
              return ELEMENTS_WITH_CLASS_APPLICATION_FILL
            case "token-separator":
              return ELEMENTS_WITH_CLASS_TOKEN_SEPARATOR_FILL
            case "progress-background":
              return ELEMENTS_WITH_CLASS_PROGRESS_BACKGROUND_FILL
          }
        })
    })

    it("sets the fill of all elements with class `background-fill` to background color", () => {
      const settingsManager = new SettingsManager()
      // Note that ColorSchemeName.black is currently the only scheme which toggles the background from black to white
      const NEW_COLOR_SCHEME_NAME = ColorSchemeName.black
      expect(settingsManager.getSettings().colorScheme).not.toBe(
        NEW_COLOR_SCHEME_NAME
      )
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { colorScheme: NEW_COLOR_SCHEME_NAME }
      })

      updateColors(settingsManager)

      expect(
        ELEMENTS_WITH_CLASS_BACKGROUND_FILL.every(
          element =>
            element.style.fill ===
            ColorSchemes[NEW_COLOR_SCHEME_NAME].backgroundColor
        )
      ).toBe(true)
    })

    it("sets the fill of all elements with class `application-fill` to primary color", () => {
      const settingsManager = new SettingsManager()
      const NEW_COLOR_SCHEME_NAME = ColorSchemeName.fb_mint
      expect(settingsManager.getSettings().colorScheme).not.toBe(
        NEW_COLOR_SCHEME_NAME
      )
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { colorScheme: NEW_COLOR_SCHEME_NAME }
      })

      updateColors(settingsManager)

      expect(
        ELEMENTS_WITH_CLASS_APPLICATION_FILL.every(
          element =>
            element.style.fill ===
            ColorSchemes[NEW_COLOR_SCHEME_NAME].primaryColor
        )
      ).toBe(true)
    })

    it("sets the fill of all elements with class `token-separator` to secondary color", () => {
      const settingsManager = new SettingsManager()
      const NEW_COLOR_SCHEME_NAME = ColorSchemeName.fb_aqua
      expect(settingsManager.getSettings().colorScheme).not.toBe(
        NEW_COLOR_SCHEME_NAME
      )
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { colorScheme: NEW_COLOR_SCHEME_NAME }
      })

      updateColors(settingsManager)

      expect(
        ELEMENTS_WITH_CLASS_TOKEN_SEPARATOR_FILL.every(
          element =>
            element.style.fill ===
            ColorSchemes[NEW_COLOR_SCHEME_NAME].secondaryColor
        )
      ).toBe(true)
    })

    it("sets the fill of all elements with class `progress-background` to secondary color", () => {
      const settingsManager = new SettingsManager()
      const NEW_COLOR_SCHEME_NAME = ColorSchemeName.fb_pink
      expect(settingsManager.getSettings().colorScheme).not.toBe(
        NEW_COLOR_SCHEME_NAME
      )
      settingsManager.updateSettings({
        type: "UPDATE_SETTINGS_MESSAGE",
        updatedSettings: { colorScheme: NEW_COLOR_SCHEME_NAME }
      })
      const ELEMENT_WITH_ID_ROOT = {
        id: ROOT_ID,
        style: { display: "none" }
      } as unknown as GraphicsElement
      jest
        .spyOn(document, "getElementById")
        .mockImplementation((id: string) =>
          id === ROOT_ID ? ELEMENT_WITH_ID_ROOT : undefined
        )

      updateColors(settingsManager)

      expect(ELEMENT_WITH_ID_ROOT.style.display).toBe("inline")
    })

    it("shows the root element", () => {
      const settingsManager = new SettingsManager()

      updateColors(settingsManager)
    })

    function generateElementsForClassName(className: string) {
      return [
        {
          class: className,
          style: { fill: "some fill" }
        } as unknown as GraphicsElement,
        {
          class: className,
          style: { fill: "some fill" }
        } as unknown as GraphicsElement
      ]
    }
  })
})
