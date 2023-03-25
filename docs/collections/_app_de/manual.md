---
layout: page
lang: de
permalink: de/app/
menu_sort_key: 0
---

# Anleitung

<!-- spellchecker:ignore enlarged -->

<nav>
  - Inhaltsverzeichnis
  {:toc}
</nav>

## Schnellstart

1. Öffnen Sie die App auf Ihrer Smartwatch.
2. Öffnen Sie die Einstellungen dieser App innerhalb der Fitbit-App auf Ihrem Smartphone.
3. Fügen Sie Token in den Einstellungen hinzu, indem Sie
   - [Token via QR-Tag hinzufügen](#tokens)
   - [Token manuell hinzufügen](#token-manuell-hinzufügen)
4. Falls gewünscht, passen Sie die Anzeigenamen der Token an, indem Sie in der
   Liste der Tokens auf den entsprechenden Namen klicken
5. Falls Sie bei der Verwendung der App nicht auf eine Verbindung zum Smartphone
   angewiesen sein wollen, können Sie dies bei den Einstellungen aktiveren.
   Bitte lesen Sie jedoch vorher, [welche Sicherheitskonsequenzen dies
   hat](./faq#weshalb-werden-die-token-nicht-standardm%C3%A4ssig-auf-der-smartwatch-gespeichert).

## Einstellungen in der Companion-App

Dieser Abschnitt behandelt alle in der Companion-App vorhandenen Einstellungen.

### Tokens

Bei der Liste der Token können Sie rechts mit der Bearbeitungsschaltfläche die
Reihenfolge der Token Ihren Wünschen anpassen oder Token wieder entfernen. Sie
können den angezeigten Namen eines Tokens anpassen, indem Sie in der Liste auf
den jeweiligen Namen klicken. Mit der Schaltfläche "<samp>Token via QR-Tag
hinzufügen</samp>" können Sie Token über Ihre Smartphone-Kamera oder auf Ihrem
Smartphone gespeicherte Photos hinzufügen.

Bitte beachten Sie, dass wegen [technischen
Einschränkungen](./faq#warum-werden-qr-tags-teilweise-nicht-erkannt) Token auf
diesem Weg teilweise nicht eingelesen werden können.

### Token manuell hinzufügen

Dieser Bereich erlaubt Tokenkonfigurationen von Hand einzugeben, beispielsweise
wenn die Erkennung des QR-Tags nicht funktioniert (siehe ["Warum werden QR-Tags
teilweise nicht erkannt?"](./faq#warum-werden-qr-tags-teilweise-nicht-erkannt)).

### Einstellungen

Dieser Abschnitt enthält alle Einstellungen, welche nicht das Hinzufügen,
Löschen oder Umordnen von Token betreffen.

#### Uhrenfehler kompensieren

Einige Smartwatches verfügen über vergleichsweise ungenaue interne Zeitgeber,
was über längere Zeit zu Zeitunterschieden bis in den Minutenbereich führen
kann, wenn die Smartwatch nicht täglich oder häufiger synchronisiert wird. Da
das Standardzeitfenster von TOTP-Tokens 30 Sekunden umfasst, ist bereits eine
Zeitdifferenz von wenigen Sekunden problematisch. Deshalb überträgt die
Companion-App beim Starten der App sowie bei der Anpassung diverser
Einstellungen die aktuelle Zeit des Smartphones zur Smartwatch, um innerhalb der
App die Zeit an das Smartphone anzugleichen. Die Kompensation des Uhrenfehlers
funktioniert somit jedoch nur, wenn eine Verbindung zum Smartphone besteht.

#### Tokens auf Smartwatch speichern

Sie können die Token zusätzlich auf der Smartwatch speichern, wodurch beim Start
der App auf der Smartwatch keine Verbindung zu Ihrem Smartphone mehr vorhanden
sein muss. Weil dies
[Sicherheitskonsequenzen](./faq#weshalb-werden-die-token-nicht-standardm%C3%A4ssig-auf-der-smartwatch-gespeichert)
hat, ist diese Einstellung standardmässig nicht aktiviert.

#### Vergrösserte Tokenansicht

Für eine bessere Lesbarkeit lässt sich die Darstellung der Tokenansicht
vergrössern. Da dies die Anzahl gleichzeitig angezeigter Token deutlich
reduziert, ist diese Einstellung jedoch standardmässig nicht aktiviert.

![Vergrösserte Tokenansicht]({{ "/assets/screenshots/cut/enlarged_default.png" | relative_url }}){: height="169px" width="169px"}

#### Farbschema

Sie können bei der Einstellung Farbschema zwischen sechs verschiedenen Farbschemata auswählen:

<p style="display:flex; flex-wrap: wrap; grid-gap: 10px;"> <!-- spellchecker:disable-line -->
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_default.png" | relative_url }}" alt="Tokenansicht mit Standardfarbschema" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_cyan.png" | relative_url }}" alt="Tokenansicht mit Farbschema cyan" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_green.png" | relative_url }}" alt="Tokenansicht mit Farbschema grün" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_pink.png" | relative_url }}" alt="Tokenansicht mit Farbschema pink" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_white.png" | relative_url }}" alt="Tokenansicht mit Farbschema weiss" />
  <img width="169" height="169" src="{{ "/assets/screenshots/cut/normal_black.png" | relative_url }}" alt="Tokenansicht mit Farbschema schwarz" />
</p>

### Lizenzinformationen

Der Abschnitt Lizenzinformationen beinhaltet sowohl Copyright als auch Version
dieser App, als auch die Lizenzdaten der integrierten Software von
Drittanbietern.
