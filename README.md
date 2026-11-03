# QUIZLAB - Browser-Quiz

Ein mobilfreundliches HTML-Quiz im Dark Mode mit blauer Akzentfarbe.
Keine Installation, kein Framework, kein Backend und keine Internetverbindung erforderlich.

## Starten

1. Die ZIP-Datei entpacken.
2. Alle vier Dateien im selben Ordner lassen.
3. `index.html` in einem Browser aufrufen.

Sollte der Browser `localStorage` bei lokal geöffneten HTML-Dateien blockieren,
kann das Spiel auch über einen kleinen lokalen Webserver gestartet werden:

```bash
cd quizspiel
python3 -m http.server 8000
```

Anschließend im Browser `http://localhost:8000` aufrufen.

## Enthaltene Dateien

- `index.html` - HTML-Grundstruktur
- `styles.css` - Layout, Dark Mode und mobile Darstellung
- `questions.js` - 75 Fragen in 5 Kategorien mit 3 Schwierigkeitsgraden
- `app.js` - Spielablauf, Joker, Zeitmessung, Statistik und localStorage

## Regeln

- 3 Runden mit jeweils 5 Fragen: leicht, mittel, schwer.
- Jede Frage besitzt genau 4 Antwortmöglichkeiten.
- Ein 50:50-Joker ist pro Spiel einmal verwendbar. Er entfernt zwei falsche Antworten.
- Beim dritten Fehler endet das Spiel sofort.
- Nach jeder Antwort (ausser am Spielende) wird eine kurze Erklärung angezeigt.
- Zwischen den Runden gibt es eine Pause mit eigenem Startknopf.
- In der Schlussauswertung: aktive Spielzeit, Fehler, richtige Antworten,
  am längsten bearbeitete Frage und Ort des Jokereinsatzes.
- Das laufende Spiel wird in localStorage gespeichert und bei erneutem Oeffnen fortgesetzt.
  Auch das Ergebnis bleibt bis zum Start eines neuen Spiels erhalten.

## Fragen anpassen

In `questions.js` befindet sich das Array `QUESTION_ROWS`. Jede Zeile folgt dem Schema:

```js
[id, kategorie, schwierigkeit, frage, [antwortA, antwortB, antwortC, antwortD], richtigerIndex, erklaerung]
```

- `schwierigkeit`: `easy`, `medium` oder `hard`
- `richtigerIndex`: 0 = A, 1 = B, 2 = C, 3 = D
- Jede Frage braucht eine eindeutige und möglichst unveränderliche `id`.
- Eine neue auswählbare Kategorie benötigt mindestens fünf Fragen pro Schwierigkeitsgrad.
- Fragen werden beim Spielstart innerhalb des Schwierigkeitsgrads gemischt.

## Bedienung

- Mit Mausklick oder Touch spielen.
- Die Zifferntasten `1` bis `4` wählen die Antworten A bis D.
- Taste `J` aktiviert den Joker, solange er noch nicht benutzt wurde.
- Ein neues Spiel kann jederzeit oben rechts gestartet werden.

**Datenschutz:** Das Spiel speichert den Spielstand ausschließlich im `localStorage`
des verwendeten Browsers. Es sendet keine Daten an einen Server.
