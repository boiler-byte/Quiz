# Quizlab – Delta v2

Dieses Update ergänzt eine Wiederholungssperre und macht Quizlab als Progressive Web App (PWA) installierbar.

## Installation des Deltas

1. Den Inhalt von `delta.v2.zip` in den vorhandenen Quizlab-Ordner entpacken.
2. Vorhandene `app.js` und `index.html` überschreiben; neue Dateien und den Ordner `icons` übernehmen.
3. Die bestehende `questions.js` mit 750 Fragen unverändert beibehalten. Auch `styles.css` bleibt unverändert.
4. Die App über **HTTPS** bereitstellen (alternativ für lokale Tests `http://localhost:8000`).
5. Beim ersten Online-Aufruf werden die benötigten Dateien für spätere Offline-Nutzung zwischengespeichert.

`file://` (direktes Doppelklicken auf `index.html`) erlaubt keine Service Worker und bietet daher keine vollständige PWA-Installation/Offline-Verwaltung. Das Quiz selbst kann weiterhin lokal geöffnet werden.

## Wiederholungssperre

- Beantwortete Fragen werden in einem **separaten localStorage-Verlauf** gespeichert und über neue Spiele hinweg berücksichtigt.
- Bei einer einzelnen Kategorie bleiben die **35 zuletzt beantworteten Fragen derselben Kategorie und Schwierigkeitsstufe** für die nächste Auswahl gesperrt.
- Bei `Alle Kategorien` bleiben die **100 zuletzt beantworteten Fragen pro Schwierigkeitsstufe** für die nächste Auswahl gesperrt.
- Jede Runde verwendet weiterhin fünf verschiedene Fragen aus der gewählten Stufe.
- Bei einem verkleinerten Katalog oder unzureichend vielen Kandidaten wird auf die am längsten nicht beantworteten Fragen zurückgegriffen, damit das Quiz spielbar bleibt.
- Die Reihenfolge der vier Antwortmöglichkeiten bleibt zufällig. Bestehende Spielstände bleiben kompatibel.
- Der Verlauf wird nur für **tatsächlich beantwortete Fragen** fortgeschrieben, nicht für vorgemerkte Fragen eines abgebrochenen Spiels.
- Der Verlauf bleibt beim Starten eines neuen Spiels erhalten, kann jedoch durch Löschen der Websitedaten im Browser zurückgesetzt werden.

## PWA

- `manifest.webmanifest`: Installationsmetadaten, Start-URL, Theme und App-Symbole.
- `icons/icon-192.png`, `icons/icon-512.png`: Icons für Home-Screen und App-Launcher.
- `service-worker.js`: Cache der App-Dateien (inklusive der vorhandenen `questions.js`); Offline-Fallback.
- Aktualisierte Dateien werden bei vorhandener Netzwerkverbindung erneut vom Server bezogen.
- Sofern der Browser `beforeinstallprompt` unterstützt, erscheint die Schaltfläche **App installieren**. Auf iOS erfolgt die Installation über **Teilen → Zum Home-Bildschirm**.

Die App speichert Fragenverlauf und Spielstand nur lokal im Browser; es ist kein Backend nötig.
