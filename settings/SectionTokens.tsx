import { gettext } from "i18n"
import { TotpConfig } from "../companion/tokens"
import { getDisplayName, UPDATE_DISPLAY_NAME_SETTINGS_KEY } from "./ui"

export function SectionTokens({ settingsStorage }) {
  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("Tokens")}
        </Text>
      }
      description={<Text>{gettext("Tokens section description")}</Text>}
    >
      {/* Note that the `settingsKey` is deliberately not set to TOKENS_SETTINGS_KEY because doing so would import /companion/tokens.ts which would break the build due to `settingsStorage` not being importable from within settings */}
      <AdditiveList
        settingsKey="tokens"
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
        addAction={<Text> </Text>} // To hide the button, since the entries are currently added via a form
      />
    </Section>
  )
}
