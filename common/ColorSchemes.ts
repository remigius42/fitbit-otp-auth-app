export enum ColorSchemeName {
  default = "default",
  fb_aqua = "fb-aqua",
  fb_mint = "fb-mint",
  fb_pink = "fb-pink",
  white = "white",
  black = "black"
}

enum PrimaryColor {
  bp_amber = "#ffd502",
  fb_aqua = "#3BF7DE",
  fb_mint = "#5BE37D",
  fb_pink = "#FF78B7",
  white = "#ffffff",
  black = "#000000"
}

enum SecondaryColor {
  bp_amber_darkened = "#704d00",
  fb_aqua_darkened = "#11685d",
  fb_mint_darkened = "#105625",
  fb_pink_darkened = "#80114f",
  dark_grey = "#555555",
  light_grey = "#999999"
}

enum BackgroundColor {
  black = "#000000",
  white = "#ffffff"
}

export type Color = PrimaryColor | SecondaryColor | BackgroundColor

interface ColorScheme {
  primaryColor: PrimaryColor
  secondaryColor: SecondaryColor
  backgroundColor: BackgroundColor
}

export const ColorSchemes: Record<ColorSchemeName, ColorScheme> = {
  [ColorSchemeName.default]: {
    primaryColor: PrimaryColor.bp_amber,
    secondaryColor: SecondaryColor.bp_amber_darkened,
    backgroundColor: BackgroundColor.black
  },
  [ColorSchemeName.fb_aqua]: {
    primaryColor: PrimaryColor.fb_aqua,
    secondaryColor: SecondaryColor.fb_aqua_darkened,
    backgroundColor: BackgroundColor.black
  },
  [ColorSchemeName.fb_mint]: {
    primaryColor: PrimaryColor.fb_mint,
    secondaryColor: SecondaryColor.fb_mint_darkened,
    backgroundColor: BackgroundColor.black
  },
  [ColorSchemeName.fb_pink]: {
    primaryColor: PrimaryColor.fb_pink,
    secondaryColor: SecondaryColor.fb_pink_darkened,
    backgroundColor: BackgroundColor.black
  },
  [ColorSchemeName.white]: {
    primaryColor: PrimaryColor.white,
    secondaryColor: SecondaryColor.dark_grey,
    backgroundColor: BackgroundColor.black
  },
  [ColorSchemeName.black]: {
    primaryColor: PrimaryColor.black,
    secondaryColor: SecondaryColor.light_grey,
    backgroundColor: BackgroundColor.white
  }
}
