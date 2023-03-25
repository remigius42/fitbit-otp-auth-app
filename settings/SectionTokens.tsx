import { gettext } from "i18n"
import { getDisplayName } from "../common/formatTokens"
import type { TotpConfig } from "../common/TotpConfig"
import { NewTokenButton } from "../companion/ui/NewTokenButton"
import { TOKENS_SETTINGS_KEY } from "../companion/ui/settingsKeys"
import ConnectionStatus from "./ConnectionStatus"
import {
  getValidationMessageSetting,
  UPDATE_DISPLAY_NAME_SETTINGS_KEY
} from "./ui"
import ValidationMessage from "./ValidationMessage"

export function SectionTokens({ settingsStorage }) {
  /** Edge length in pixels of the image to be processed by the QR code scanner.
   * Note that increasing above 400 lead to unusable recognition rates and
   * beyond 600 might crash the Companion app. */
  const IMAGE_EDGE_LENGTH = 300

  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("Tokens")}
        </Text>
      }
      description={<Text>{gettext("Tokens section description")}</Text>}
    >
      <AdditiveList
        settingsKey={TOKENS_SETTINGS_KEY}
        renderItem={token => (
          <TextInput
            placeholder=""
            value={getDisplayName(token as unknown as TotpConfig)}
            onChange={newValue =>
              settingsStorage.setItem(
                UPDATE_DISPLAY_NAME_SETTINGS_KEY,
                JSON.stringify({ token, value: newValue })
              )
            }
          />
        )}
        onListChange={() =>
          settingsStorage.removeItem(
            getValidationMessageSetting(NewTokenButton.addTokenViaQrTag)
          )
        }
        addAction={
          <ImagePicker
            label={gettext("Add token via QR tag")}
            pickerTitle={gettext("Import QR tag from an image")}
            pickerImageTitle={gettext("Current QR tag image.")}
            pickerLabel={gettext("Import new QR tag")}
            settingsKey={NewTokenButton.addTokenViaQrTag}
            imageWidth={IMAGE_EDGE_LENGTH}
            imageHeight={IMAGE_EDGE_LENGTH}
          />
        }
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenButton.addTokenViaQrTag}
      />

      <ConnectionStatus settingsStorage={settingsStorage} />
    </Section>
  )
}
