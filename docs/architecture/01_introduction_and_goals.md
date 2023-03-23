# Introduction and Goals

`fitbit-otp-auth-app` aka. `OTP Auth` is an app for Fitbit smartwatches to
display Time-based One-time Passwords (TOTP)[^totp_rfc].

## Requirements Overview

| Requirement                | Explanation                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inspect source code        | Inspect the source code of the app. Note that due to the [release process on the Fitbit platform][release_process], it cannot be guaranteed that a certain app version corresponds to a Git tag. |
| Add token from QR code     | Add token configurations contained in QR codes. Trying to add a token which matches (same label and issuer) an existing one should fail with an error message.                                   |
| Add token manually         | Add tokens by entering their configurations manually. Trying to add a token which matches (same label and issuer) an existing one should fail with an error message.                             |
| Delete tokens              |                                                                                                                                                                                                  |
| Reorder tokens             |                                                                                                                                                                                                  |
| Name tokens                | Give custom names to tokens, for example if the original name exceeds the display width.                                                                                                         |
| Compensate clock drift     | Prevent clock drift issues with TOTPs[^totp_rfc] due to inaccurate clocks.                                                                                                                       |
| Store tokens on smartwatch | Optionally store the tokens on the smartwatch to ensure operability even if the smartphone is not connected.                                                                                     |
| Enlarge view               | Enlarge the information displayed for better readability.                                                                                                                                        |
| Change color scheme        |                                                                                                                                                                                                  |
| View license information   |                                                                                                                                                                                                  |

## Quality Goals

1. Security
2. Operability
3. Maintainability

[release_process]: https://dev.fitbit.com/build/guides/publishing/#step-3-uploading-a-build

[^totp_rfc]: See [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)
