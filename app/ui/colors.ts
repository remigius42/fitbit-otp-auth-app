import document from "document"
import { Color, ColorSchemes } from "../../common/ColorSchemes"
import { SettingsManager } from "../SettingsManager"
import { ROOT_ID } from "./ids"

/**
 * Updates the color scheme based on the current settings.
 *
 * Note that the root element is not hidden at the beginning, even though it is
 * explicitly shown at the end of the function. This works because the CSS
 * configures `#root` with `display: none` to prevent a possible color
 * flickering when the application starts and the color scheme is not the
 * default one. Since the root element is hidden via CSS at the beginning,
 * hiding via JavaScript as well would be redundant. However, this makes
 * possible that for a very short time, the color scheme is a mix of two schemes
 * when the colors are changed, but the flickering will be much more subtle than
 * if the root element is hidden and shown again.
 */
export function updateColors(settingsManager: SettingsManager) {
  const colorSchemeName = settingsManager.getSettings().colorScheme

  setFillForClassName(
    "background-fill",
    ColorSchemes[colorSchemeName].backgroundColor
  )

  setFillForClassName(
    "application-fill",
    ColorSchemes[colorSchemeName].primaryColor
  )

  const secondaryColor = ColorSchemes[colorSchemeName].secondaryColor
  setFillForClassName("token-separator", secondaryColor)
  setFillForClassName("progress-background", secondaryColor)

  showRootElement()
}

function setFillForClassName(className: string, color: Color) {
  document
    .getElementsByClassName(className)
    .forEach(
      element => ((element as unknown as GraphicsElement).style.fill = color)
    )
}

/**
 * Shows the root element of the current view.
 *
 * Note that this requires that the root elements on all views have their `id`
 * set to `root`. Unfortunately `document` only supports a subset of the DOM
 * methods and in particular `firstElementChild` and `children` are missing.
 */
function showRootElement() {
  ;(
    document.getElementById(ROOT_ID) as unknown as GraphicsElement
  ).style.display = "inline"
}
