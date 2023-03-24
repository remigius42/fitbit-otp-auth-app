# Solution Strategy

## Goal-related strategies

| Goal            | Solution approach                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Security        | Favor security over convenience in the application settings, e.g. don't store the tokens on the smartwatch by default. |
| Operability     | Add inline help text and provide an end-user manual.                                                                   |
| Maintainability | Use TypeScript instead of JavaScript.                                                                                  |

## Requirement-related strategies

| Requirement            | Solution approach                 |
| ---------------------- | --------------------------------- |
| Inspect source code    | Publicly host the source code.    |
| Add token from QR code | Add a library to decode QR codes. |
| Add token manually     | Add a library to decode base32.   |
