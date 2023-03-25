---
layout: page
permalink: app/
menu_sort_key: 0
---

# Manual

<nav>
  - Table of contents
  {:toc}
</nav>

## Quick Start

1. Open the app on your smartwatch.
2. Open the settings of this app within the Fitbit app on your smartphone.
3. Add tokens in the settings by
   - [adding tokens via QR tag](#tokens)
   - [adding tokens manually](#add-token-manually)
4. If desired, customize the display names of the tokens by clicking on the
   corresponding name in the list of tokens.
5. If you do not want to rely on a connection to your smartphone when using the
   app, you can activate this in the settings. However, please read about the
   security consequences before doing so.

## Settings in the Companion App

This section covers all settings available in the Companion App.

### Tokens

In the list of tokens, you can adjust the order of the tokens according to your
preferences or remove tokens using the edit button on the right. You may
customize the displayed name of a token by clicking on the respective entry.
With the "<samp>Add token via QR tag</samp>" button, you can add tokens using
your smartphone camera or photos saved on your smartphone.

Please note that due to [technical
limitations](./faq#why-are-qr-codes-sometimes-not-recognized), tokens may not be
read in some cases using this method.

### Add token manually

This section allows you to manually enter token configurations, for example, if
QR tag recognition does not work (see ["Why are QR tags sometimes not
recognized?"](./faq#why-are-qr-codes-sometimes-not-recognized)).

### Settings

This section contains all settings that do not relate to adding, deleting, or
rearranging tokens.

#### Compensate clock drift

Some smartwatches have relatively inaccurate internal clocks, which can lead to
time differences of up to several minutes over a longer period of time if the
smartwatch is not synchronized daily or more frequently. Since the standard
validity window of TOTP tokens is 30 seconds, even a time difference of a few
seconds can cause problems. Therefore, when the companion app starts up or when
various settings are adjusted, the app transfers the current time of the
smartphone to the smartwatch in order to synchronize the time within the app
with the smartphone. However, compensating for clock errors only works if there
is a connection to the smartphone.

#### Store tokens on smartwatch

You can also store the tokens on the smartwatch, which means that there does not
need to be a connection to your smartphone when starting the app on the
smartwatch. Because this has [security
consequences](./faq#why-arent-the-tokens-stored-on-the-smartwatch-by-default),
this setting is not enabled by default.

#### Enlarge token information

For better readability, the display of the token list can be enlarged. However,
since this significantly reduces the number of tokens displayed simultaneously,
this setting is not enabled by default.

![Enlarged token list]({{ "/assets/screenshots/cut/enlarged_default.png" | relative_url }}){:
height="169px" width="169px"}

#### Color scheme

You can choose between six different color schemes:

<p style="display:flex; flex-wrap: wrap; grid-gap: 10px;">
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_default.png" | relative_url }}" alt="Token list with default color scheme" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_cyan.png" | relative_url }}" alt="Token list with cyan color scheme" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_green.png" | relative_url }}" alt="Token list with green color scheme" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_pink.png" | relative_url }}" alt="Token list with pink color scheme" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_white.png" | relative_url }}" alt="Token list with white color scheme" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_black.png" | relative_url }}" alt="Token list with black color scheme" />
</p>

### License Information

The License Information section includes both the copyright and version
information of this app, as well as the license data of integrated third-party
software.
