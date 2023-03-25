---
layout: page
permalink: app/faq
menu_sort_key: 1
menu_label: FAQ
---

# Frequently asked questions

<nav>
  - Table of contents
  {:toc}
</nav>

## Where can security-related issues be reported?

Please **do not create a normal issue in the GitHub repository for security-related
errors**, but rather [create a Security
Advisory](https://github.com/remigius42/fitbit-otp-auth-app/security/advisories/new).

You can create a Security Advisory by clicking on the link above or by clicking
on the "<samp>Report a vulnerability</samp>" button when [creating a new
issue](https://github.com/remigius42/fitbit-otp-auth-app/issues/new/choose).

## Where can all other issues be reported?

Issues that are **not security-related** can be [reported via GitHub
Issue](https://github.com/remigius42/fitbit-otp-auth-app/issues/new?labels=bug%2Ctriage&template=bug_report.yaml&title=%5BBug%5D%3A+).

Before opening the ticket, please read the frequently asked questions on this
page in full to avoid unnecessary effort on both sides.

## Where can feature requests be submitted?

In terms of expectation management, it should first be clarified that this app
is a free time project and there is only a very **limited amount of time
available** for adjustments. For this reason, on GitHub the issue templates have
been limited to "<samp>Bug Report</samp>" and "<samp>Report a security
vulnerability</samp>".

If you have a feature request that you are convinced others would also benefit
from, please send me an email at

<address>
<a href="mailto:remigius42-github.dcds7@aleeas.com">remigius42-github.dcds7@aleeas.com</a>
</address>

While I may not be able to respond to every message, I appreciate and prioritize
all feature suggestions.

## Which Fitbit devices are supported?

Currently supported are:

- **Versa 3**
- **Sense**

At least for

- Versa 4
- Sense 2

there will likely be no support, because no third-party app support is planned
for these devices[^no_third_party_app_support].

For devices such as

- Ionic
- Versa
- Versa 2
- Versa Lite

[Authenticator](https://gallery.fitbit.com/details/ff58cce2-1f9d-4a2f-917d-3cb70c11b542),
for example, provides an alternative.

## What types of tokens are supported?

Currently, only **Time-based One-Time Passwords (TOTP)**[^totp_rfc] are
supported. However, these are supported with the hash algorithms `SHA-1`,
`SHA-256`, and `SHA-512`, and the validity period can be freely selected. Both 6
and 8 characters are supported for the password.

Counter-based tokens as well as
[Steam](https://help.steampowered.com/de/faqs/view/06B0-26E6-2CF8-254C) are
currently not supported.

## Why does it sometimes take a few seconds for changes to tokens to be transmitted to the smartwatch?

Unfortunately, the **connection** between the smartwatch and the smartphone is
**neither** particularly **fast** **nor** does it **guarantee** the **order** in
which messages are received. When making adjustments to tokens (such as display
names, order, adding or deleting), all tokens are always transmitted so that
consistency between the configuration in the companion app and the display on
the smartwatch can be better ensured. However, this also means that
**adjustments**, especially with many configured tokens, **take longer**, and it
can **rarely** happen that adjustments are **ignored** if the connection is
unstable and messages are lost. To **fix** this problem, you can **restart** the
**app** on the smartwatch, which will resynchronize the data at the beginning.

## Why does it sometimes happen that the progress indicator jumps shortly after the app starts?

This behavior can occur when **both the "<samp>Compensate clock drift</samp>"
and "<samp>Store tokens on smartwatch</samp>" settings are enabled**:

The real-time clocks in smartwatches are sometimes
inaccurate[^accuracy_of_smartwatches], which is why the app supports
compensating for clock errors based on the time of the connected smartphone. At
the same time, not all smartwatches and smartphones have stable Bluetooth
connections, which can lead to connection interruptions. To still display the
tokens, the app allows storing the tokens on the smartwatch. However, this must
be explicitly enabled for security reasons (see [Why aren't the tokens stored on
the smartwatch by
default?](#why-arent-the-tokens-stored-on-the-smartwatch-by-default)).

Once the app starts and tokens are stored on the smartwatch, they are loaded and
displayed, partly because the app cannot predict whether and when a connection
to the smartphone can be established. When the connection is established, the
companion app on the smartphone sends the current token configurations and
settings, as these may have changed in the meantime. If the "compensate clock
errors" setting is activated, the clock error will also be compensated from that
point on, which can be noticeable in a jump in the progress indicator or, in the
worst case, a change of the token. To signal that this is not an error in the
app, a message is displayed in the app during a clock synchronization.

## Why does the token information sometimes jump when scrolling through tokens?

In order to **save resources** on the smartwatch, **only** the **visible
tokens** and a few outside the visible area, which act as a buffer, **are
updated**. If this buffer is skipped due to fast scrolling, it may cause the
displayed information to jump when tokens have not been updated for a while.
However, from the next second, all tokens in the visible area should be up to
date again.

## Why are QR codes sometimes not recognized?

The **resolution** of the images that can be processed by the companion app is
**very limited** for technical reasons. Please try to **shift** and **scale**
the **QR tag capture** so that the QR tag fills the selection frame with a small
border as best as possible.

![Screenshot of the QR code import]({{ "/assets/screenshots/fit_qr_tag.jpg" | relative_url }}){: height="600px" width="309px"}

Please **do not open a GitHub issue** to report **problems with QR codes**. The
recognition rate is already relatively close to what is technically feasible for
this platform. GitHub issues related to the QR code recognition rate may be
closed without comment.

## Why aren't the tokens stored on the smartwatch by default?

For **security reasons**, the tokens are only stored on the smartwatch when the
setting is manually activated, as any person with physical access to the
smartwatch would then be able to access the tokens.

## Why does each token have its own progress indicator?

The TOTP standard[^totp_rfc] recommends time steps of 30 seconds, but other
intervals are also possible. Since the **tokens** can have **different validity
periods**, individual progress indicators are necessary.

## Why build another app for two-factor authentication?

There are similar apps available for most devices, but at the time of the
project's launch,
[Authenticator](https://gallery.fitbit.com/details/ff58cce2-1f9d-4a2f-917d-3cb70c11b542)
was the only alternative that had **disclosed its source code**. It should be
noted that due to the release process, it is not guaranteed that the app
corresponds exactly to the source code, but its open-source nature inspires more
confidence than closed-source alternatives.

In addition, with some of the alternative apps, scanning QR codes requires an
additional app for Android or iOS. This is problematic because with Fitbit apps,
permissions must be interactively granted by default, which may not necessarily
be the case with the additional app. It is therefore more difficult to exclude
the possibility that the scanned QR codes may be forwarded to third parties by
the additional Android or iOS app.

[^no_third_party_app_support]: Source: <https://community.fitbit.com/t5/Sense-2/No-apps-are-available-for-the-Sense-2/m-p/5291937#M4442>
[^totp_rfc]: See [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)
[^accuracy_of_smartwatches]: See <https://community.fitbit.com/t5/Blaze/Question-about-the-clock/td-p/1585035> and <https://community.fitbit.com/t5/Other-Versa-Smartwatches/Clock-sync-not-accurate-on-Versa-lite/td-p/4588916>
