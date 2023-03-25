---
layout: page
lang: de
permalink: de/app/faq
menu_sort_key: 1
menu_label: FAQ
---

# Häufig gestellte Fragen

<!-- spellchecker:words advisory, issues, vulnerability -->

<nav>
  - Inhaltsverzeichnis
  {:toc}
</nav>

## Wo können sicherheitsrelevante Probleme gemeldet werden?

Bitte erfassen Sie im GitHub-Repository **für sicherheitsrelevante Fehler kein
Issue, sondern ein [Security Advisory
](https://github.com/remigius42/fitbit-otp-auth-app/security/advisories/new)**.

Sie können ein Security Advisory erstellen, indem Sie auf den obigen Link
klicken, oder indem Sie beim [Erstellen eines neuen
Issues](https://github.com/remigius42/fitbit-otp-auth-app/issues/new/choose) die
Schaltfläche <samp>Report a vulnerability</samp> anklicken.

## Wo können alle anderen Probleme gemeldet werden?

Probleme, welche **nicht sicherheitsrelevant** sind, können [via GitHub-Issue
gemeldet
werden](https://github.com/remigius42/fitbit-otp-auth-app/issues/new?labels=bug%2Ctriage&template=bug_report.yaml&title=%5BBug%5D%3A+).

Bitte lesen Sie vor dem Öffnen des Tickets die häufig gestellten Fragen auf
dieser Seite vollständig durch, um beidseitig unnötigen Aufwand zu vermeiden.

## Wo können Erweiterungswünsche angebracht werden?

Im Sinne des Erwartungsmanagements sollte zuerst klargestellt werden, dass diese
App ein Freizeitprojekt ist und für Anpassungen nur ein sehr **begrenztes
Zeitkontingent** zur Verfügung steht. Aus diesem Grund wurden auf GitHub die
Issue-Vorlagen auf "<samp>Bug Report</samp>" und "<samp>Report a security
vulnerability</samp>" eingeschränkt.

Falls Sie einen Erweiterungswunsch haben, von dem Sie überzeugt sind, dass
andere auch davon profitieren würden, senden Sie mir bitte ein E-Mail an

<address>
<a href="mailto:remigius42-github.dcds7@aleeas.com">remigius42-github.dcds7@aleeas.com</a>
</address>

Aus zeitlichen Gründen werde ich die Nachricht sehr wahrscheinlich nicht
beantworten, gerne nehme ich jedoch die Vorschläge entgegen und werde sie nach
ihrer Häufigkeit priorisieren.

## Welche Fitbit-Geräte sind unterstützt?

Unterstützt werden derzeit

- **Versa 3**
- **Sense**

Zumindest für

- Versa 4
- Sense 2

wird es voraussichtlich keine Unterstützung geben, weil diese Geräte
grundsätzlich keine Apps von Drittanbietern
unterstützen[^kein_drittanbieter_support].

Für die Geräte

- Ionic
- Versa
- Versa 2
- Versa Lite

stellt beispielsweise
[Authenticator](https://gallery.fitbit.com/details/ff58cce2-1f9d-4a2f-917d-3cb70c11b542)
eine Alternative dar.

## Welche Arten von Tokens werden unterstützt?

Aktuell werden nur **Time-based One-Time Passwords (TOTP)**[^totp_rfc]
unterstützt. Diese allerdings mit den Hash-Algorithmen `SHA-1`, `SHA-256` und
`SHA-512`, die Gültigkeitsperiode ist frei wählbar und es werden sowohl 6 als
auch 8 Zeichen beim Passwort unterstützt.

Zählerbasierte Token sowie
[Steam](https://help.steampowered.com/de/faqs/view/06B0-26E6-2CF8-254C) werden
derzeit nicht unterstützt.

## Weshalb dauert es manchmal ein paar Sekunden, bis Anpassungen an Token an die Smartwatch übertragen wurden?

Die **Verbindung** zwischen der Smartwatch und dem Smartphone ist leider
**weder** besonders **schnell**, **noch garantiert** sie die **Reihenfolge**, in
der **Nachrichten** empfangen werden. Bei Anpassungen an den Token (z.B.
Anzeigenamen, Reihenfolge, Hinzufügen oder Löschen) werden immer alle Token
übertragen, damit die Konsistenz zwischen der Konfiguration in der Companion-App
und der Anzeige auf der Smartwatch besser gewährleistet werden kann. Dies führt
jedoch auch dazu, dass **Anpassungen**, besonders bei vielen konfigurierten
Token, länger **dauern** und es kann **selten** vorkommen, dass Anpassungen
**ignoriert** werden, falls die Verbindung instabil ist und Nachrichten verloren
gehen. Um dieses Problem zu **beheben**, können Sie die **App** auf der
Smartwatch **neu starten**, wodurch die Daten zu Beginn wieder synchronisiert
werden.

## Weshalb kommt es manchmal vor, dass die Fortschrittsanzeige kurz nach dem Start der App springt?

Dieses Verhalten kann auftreten, wenn **beide Einstellungen "<samp>Uhrenfehler
kompensieren</samp>" und "<samp>Tokens auf Smartwatch speichern</samp>"
aktiviert** sind:

Die Zeitgeber in Smartwatches sind teilweise
ungenau[^genauigkeit_von_smartwatches], deshalb unterstützt die App einen
Ausgleich des Uhrenfehlers basierend auf der Zeit des verbundenen Smartphones.
Gleichzeitig haben nicht alle Smartwatches und Smartphones stabile
Bluetooth-Verbindungen, was zu Verbindungsabbrüchen führen kann. Damit die Token
trotzdem angezeigt werden können, ermöglicht es die App die Token auf der
Smartwatch zu speichern. Allerdings muss dies aus Sicherheitsgründen explizit
aktiviert werden (siehe [Weshalb werden die Token nicht standardmässig auf der
Smartwatch
gespeichert?](#weshalb-werden-die-token-nicht-standardmässig-auf-der-smartwatch-gespeichert)).

Sobald die App startet und Token auf der Smartwatch gespeichert sind, werden
diese geladen und angezeigt, mitunter weil die App nicht vorhersehen kann, ob
und wann eine Verbindung zum Smartphone aufgebaut werden kann. Wenn die
Verbindung hergestellt ist, sendet die Companion-App auf dem Smartphone die
aktuellen Token-Konfigurationen und Einstellungen, da diese zwischenzeitlich
geändert haben könnten. Wenn die Einstellungen "<samp>Uhrenfehler
kompensieren</samp>" aktiviert, wird ab diesem Zeitpunkt auch der Uhrenfehler
ausgeglichen, was sich in einem Sprung bei der Fortschrittsanzeige oder
schlimmstenfalls einem Wechsel des Tokens bemerkbar machen kann. Um zu
signalisieren, dass es sich dabei nicht um einem Fehler in der App handelt, wird
bei einem Uhrenabgleich eine Nachricht auf der App angezeigt.

## Weshalb kommt es manchmal vor, dass beim Scrollen der Token die Anzeige springt?

Um auf der Smartwatch **Ressourcen zu sparen** werden **lediglich** die
**sichtbaren Token** sowie ausserhalb des sichtbaren Bereichs ein paar weitere
als Puffer **aktualisiert**. Wenn bei schnellem Scrollen dieser Puffer
übersprungen wird, kann es vorkommen, dass die Anzeige bei einzelnen Token
springt, weil diese länger nicht aktualisiert wurden. Ab der nächsten Sekunde
sollten alle Token im sichtbaren Bereich wieder aktuell sein.

## Warum werden QR-Tags teilweise nicht erkannt?

Die **Auflösung** der Bilder, welche von der Companion-App verarbeitet werden
können, ist aus technischen Gründen **sehr begrenzt**. Bitte versuchen Sie, die
**Aufnahme** des QR-Tags so zu **verschieben** und zu **skalieren**, dass das
QR-Tag mit einem kleinen Rand den Auswahlrahmen möglichst gut ausfüllt.

![Screenshot des QR-Tag-Imports]({{ "/assets/screenshots/fit_qr_tag.jpg" | relative_url }}){: height="600px" width="309px"}

Bitte eröffnen Sie **kein GitHub-Issue** um **Probleme mit QR-Tags** zu melden.
Die Erkennungsrate liegt tendenziell bereits relativ nahe am für diese Plattform
technisch machbaren. GitHub-Issues betreffend der QR-Tag-Erkennungsrate werden
möglicherweise kommentarlos geschlossen.

## Weshalb werden die Token nicht standardmässig auf der Smartwatch gespeichert?

Aus **Sicherheitsüberlegungen** werden die Token erst auf der Smartwatch
gespeichert, wenn die Einstellung manuell aktiviert wird, weil dadurch jede
Person mit physischem Zugang zur Smartwatch auf die Token zugreifen kann.

## Warum hat jedes Token eine eigene Fortschrittsanzeige?

Der TOTP-Standard[^totp_rfc] empfiehlt Zeitschritte von 30 Sekunden, es sind
jedoch auch andere Intervalle möglich. Da die **Token somit unterschiedliche
Gültigkeitszeitfenster** haben können, sind individuelle Fortschrittsanzeigen
erforderlich.

## Wozu noch eine App für die Zwei-Faktor-Authentisierung?

Es gibt ähnliche Apps für die meisten Modelle, jedoch war zum Zeitpunkt des
Projektstarts
[Authenticator](https://gallery.fitbit.com/details/ff58cce2-1f9d-4a2f-917d-3cb70c11b542)
die einzige Alternative, welche den **Quellcode offengelegt** hat.
Zugegebenermassen ist wegen dem Release-Prozess nicht garantiert, dass die App
tatsächlich dem Quellcode entspricht, es wirkt deutlich seriöser als die
Closed-Source-Alternativen.

Zudem gibt es bei den alternativen Apps, welche das Scannen von QR-Tags mit
einer zusätzliche App für Android oder iOS durchführen. Dies ist problematisch,
weil bei Fitbit-Apps die Berechtigungen standardmässig interaktiv freigegeben
werden müssen, was bei der zusätzlichen App nicht zwingend der Fall sein muss.
Es ist somit schwieriger auszuschliessen, dass die eingelesenen QR-Tags von der
zusätzlichen Android- oder iOS-App an Drittpersonen weitergeleitet werden.

[^kein_drittanbieter_support]: Quelle: <https://community.fitbit.com/t5/Sense-2/No-apps-are-available-for-the-Sense-2/m-p/5291937#M4442>
[^totp_rfc]: Siehe [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)
[^genauigkeit_von_smartwatches]: Siehe <https://community.fitbit.com/t5/Blaze/Question-about-the-clock/td-p/1585035> und <https://community.fitbit.com/t5/Other-Versa-Smartwatches/Clock-sync-not-accurate-on-Versa-lite/td-p/4588916>
