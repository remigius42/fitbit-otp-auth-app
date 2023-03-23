# System Scope and Context

This app does not communicate with external systems directly nor does it have
different user roles or multiple users operating the same instance. Therefore
the app restricted to the app context on the smartwatch and its corresponding
Companion app settings within the Fitbit app on the smartphone.

The only exceptions are:

- The app settings accept external data via images to be parsed for a QR code.
  These images can be taken by the smartphone camera or chosen by the user out
  of the images on the smartphone.
- The app settings have outgoing links, namely
  - the [documentation hosted on GitHub](https://remigius42.github.io/fitbit-tokens-tmp/)
  - the [buymeacoffee profile](https://www.buymeacoffee.com/remigius)
