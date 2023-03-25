import { gettext } from "i18n"

export default function SectionIntroduction() {
  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("Introduction")}
        </Text>
      }
    >
      <Text>{gettext("Welcome to the OTP Auth App!")}</Text>
      <Link source="https://remigius42.github.io/fitbit-otp-auth-app/">
        {gettext("User documentation")}
      </Link>
      <Link source="https://www.buymeacoffee.com/remigius">
        {gettext("Please help support this app by donating a coffee")}
      </Link>
    </Section>
  )
}
