(() => {
  "use strict";

  const STORAGE_KEY = "quizlab-spielstand-v1";
  const STORAGE_VERSION = 1;
  const HISTORY_KEY = "quizlab-fragenverlauf-v2";
  const HISTORY_VERSION = 2;
  // Maximal 35 zuletzt beantwortete Fragen je Kategorie/Stufe sperren;
  // im Kategorienmix 100 je Stufe (sofern ausreichend neue Fragen vorhanden sind).
  const CATEGORY_COOLDOWN = 35;
  const MIXED_COOLDOWN = 100;
  const HISTORY_MAX_PER_LEVEL = 750;
  const QUESTIONS_PER_ROUND = 5;
  const TOTAL_QUESTIONS = 15;
  const MAX_MISTAKES = 3;
  const ALL_CATEGORIES = "Alle Kategorien";
  const ROUNDS = [
    { difficulty: "easy", label: "Leicht", title: "Der Einstieg.", description: "Fünf leichte Fragen zum Warmwerden." },
    { difficulty: "medium", label: "Mittel", title: "Eine Stufe höher.", description: "Fünf mittelschwere Fragen. Konzentriert bleiben." },
    { difficulty: "hard", label: "Schwer", title: "Das Finale.", description: "Noch fünf anspruchsvolle Fragen bis zum Ziel." }
  ];

  const app = document.getElementById("app");
  const resetButton = document.getElementById("reset-button");
  const saveStatus = document.getElementById("save-status");
  const restoreToast = document.getElementById("restore-toast");
  const questions = Array.isArray(window.QUIZ_QUESTIONS) ? window.QUIZ_QUESTIONS : [];
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const allCategoryNames = [...new Set(questions.map((question) => question.category))].sort((a, b) => a.localeCompare(b, "de"));
  const categories = allCategoryNames.filter((category) => ROUNDS.every((round) =>
    questions.filter((q) => q.category === category && q.difficulty === round.difficulty).length >= QUESTIONS_PER_ROUND
  ));

  let selectedCategory = ALL_CATEGORIES;
  let game = null;
  let clockAnchor = null;
  let lastSavedSecond = -1;
  let storageAvailable = true;

  function html(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    const two = (n) => String(n).padStart(2, "0");
    return hours > 0 ? `${two(hours)}:${two(minutes)}:${two(rest)}` : `${two(minutes)}:${two(rest)}`;
  }

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Speichert für jede Frage die Bildschirmpositionen als Indizes der Originalantworten.
  function createAnswerOrders(questionIds) {
    return Object.fromEntries(questionIds.map((id) => [id, shuffle([0, 1, 2, 3])]));
  }

  function answerOrder(q) {
    return game.answerOrders[q.id];
  }

  // Unabhängig vom Spielstand: Der Verlauf bleibt auch nach "Neues Spiel" erhalten.
  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
      if (saved?.version !== HISTORY_VERSION || !saved.levels) return emptyHistory();
      const levels = {};
      for (const round of ROUNDS) {
        const entries = saved.levels[round.difficulty];
        levels[round.difficulty] = Array.isArray(entries)
          ? entries.filter((id) => typeof id === "string" &&
              questionMap.get(id)?.difficulty === round.difficulty).slice(-HISTORY_MAX_PER_LEVEL)
          : [];
      }
      return { version: HISTORY_VERSION, levels };
    } catch (error) { return emptyHistory(); }
  }

  function emptyHistory() {
    return { version: HISTORY_VERSION, levels: Object.fromEntries(ROUNDS.map((r) => [r.difficulty, []])) };
  }

  let questionHistory = loadHistory();

  function rememberAnsweredQuestion(id) {
    const q = questionMap.get(id);
    if (!q) return;
    const level = questionHistory.levels[q.difficulty];
    // Eine erneut beantwortete Frage wird zur neuesten im Verlauf.
    questionHistory.levels[q.difficulty] = [...level.filter((oldId) => oldId !== id), id]
      .slice(-HISTORY_MAX_PER_LEVEL);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(questionHistory)); }
    catch (error) { /* Bei gesperrtem Speicher funktioniert die Auswahl innerhalb der Sitzung. */ }
  }

  function chooseQuestions(round, selectedCategory) {
    const pool = questions.filter((q) => q.difficulty === round.difficulty &&
      (selectedCategory === ALL_CATEGORIES || q.category === selectedCategory));
    const poolIds = new Set(pool.map((q) => q.id));
    const history = questionHistory.levels[round.difficulty]
      .filter((id) => poolIds.has(id));
    // Sperre nur so viele Fragen, dass mindestens fünf auswählbar bleiben.
    const limit = Math.min(selectedCategory === ALL_CATEGORIES ? MIXED_COOLDOWN : CATEGORY_COOLDOWN,
      Math.max(0, pool.length - QUESTIONS_PER_ROUND));
    const locked = new Set(history.slice(-limit));
    const available = pool.filter((q) => !locked.has(q.id));
    // Fallback bei geänderten/kleinen Katalogen: zuerst die am längsten nicht
    // gestellten Fragen zulassen, statt die Runde unspielbar zu machen.
    if (available.length < QUESTIONS_PER_ROUND) {
      const ranking = new Map(history.map((id, index) => [id, index]));
      return shuffle(pool).sort((a, b) =>
        (ranking.has(a.id) ? ranking.get(a.id) : -1) -
        (ranking.has(b.id) ? ranking.get(b.id) : -1))
        .slice(0, QUESTIONS_PER_ROUND).map((q) => q.id);
    }
    return shuffle(available).slice(0, QUESTIONS_PER_ROUND).map((q) => q.id);
  }

  function validateCatalog() {
    if (!questions.length) return "Die Datei questions.js konnte nicht geladen werden oder enthält keine Fragen.";
    if (new Set(questions.map((q) => q.id)).size !== questions.length) return "Im Fragenkatalog wurden doppelte IDs gefunden.";
    for (const q of questions) {
      if (typeof q.id !== "string" || !q.id || typeof q.category !== "string" || !q.category ||
          typeof q.question !== "string" || !q.question ||
          !ROUNDS.some((round) => round.difficulty === q.difficulty) ||
          !Array.isArray(q.answers) || q.answers.length !== 4 ||
          q.answers.some((answer) => typeof answer !== "string" || !answer) ||
          !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
        return `Ungueltiger Frage-Eintrag: ${html(q.id || "ohne ID")}.`;
      }
    }
    for (const round of ROUNDS) {
      if (questions.filter((q) => q.difficulty === round.difficulty).length < QUESTIONS_PER_ROUND) {
        return `Für die Stufe ${round.label} fehlen Fragen.`;
      }
    }
    return null;
  }

  function validSavedGame(value) {
    if (!value || value.version !== STORAGE_VERSION ||
        !["question", "feedback", "roundIntro", "finished"].includes(value.phase) ||
        !Number.isInteger(value.index) || value.index < 0 || value.index >= TOTAL_QUESTIONS ||
        !Array.isArray(value.questionIds) || value.questionIds.length !== TOTAL_QUESTIONS ||
        new Set(value.questionIds).size !== TOTAL_QUESTIONS ||
        !Array.isArray(value.answers) || !value.joker ||
        !Number.isFinite(value.elapsedMs) || value.elapsedMs < 0 ||
        !Number.isFinite(value.questionElapsedMs) || value.questionElapsedMs < 0) return false;

    for (let i = 0; i < TOTAL_QUESTIONS; i += 1) {
      const q = questionMap.get(value.questionIds[i]);
      if (!q || q.difficulty !== ROUNDS[Math.floor(i / QUESTIONS_PER_ROUND)].difficulty ||
          (value.category !== ALL_CATEGORIES && q.category !== value.category)) return false;
    }
    if (value.answerOrders !== undefined && (
        !value.answerOrders || typeof value.answerOrders !== "object" ||
        value.questionIds.some((id) => !Array.isArray(value.answerOrders[id]) ||
          value.answerOrders[id].length !== 4 ||
          new Set(value.answerOrders[id]).size !== 4 ||
          value.answerOrders[id].some((n) => !Number.isInteger(n) || n < 0 || n > 3)))) return false;

    if (value.answers.length > TOTAL_QUESTIONS ||
        value.answers.some((answer, index) => {
          const q = questionMap.get(value.questionIds[index]);
          return !answer || answer.id !== q.id || !Number.isInteger(answer.selectedIndex) ||
            answer.selectedIndex < 0 || answer.selectedIndex > 3 ||
            answer.correct !== (answer.selectedIndex === q.correctIndex) ||
            !Number.isFinite(answer.elapsedMs) || answer.elapsedMs < 0;
        })) return false;

    const errors = value.answers.filter((answer) => !answer.correct).length;
    if (value.mistakes !== errors || errors > MAX_MISTAKES) return false;
    if (["question", "roundIntro"].includes(value.phase) && value.answers.length !== value.index) return false;
    if (["feedback", "finished"].includes(value.phase) && value.answers.length !== value.index + 1) return false;
    if (value.phase === "roundIntro" && ![5, 10].includes(value.index)) return false;
    if (value.phase === "finished" && errors < MAX_MISTAKES && value.answers.length !== TOTAL_QUESTIONS) return false;
    if (typeof value.joker.used !== "boolean") return false;
    if (value.joker.used) {
      const jokerQuestion = questionMap.get(value.joker.questionId);
      if (!jokerQuestion || !value.questionIds.includes(value.joker.questionId) ||
          !Array.isArray(value.joker.hiddenIndices) || value.joker.hiddenIndices.length !== 2 ||
          new Set(value.joker.hiddenIndices).size !== 2 ||
          value.joker.hiddenIndices.some((index) => !Number.isInteger(index) || index < 0 || index > 3 || index === jokerQuestion.correctIndex)) return false;
    }
    return true;
  }

  function updateSaveStatus() {
    saveStatus.classList.toggle("is-error", !storageAvailable);
    saveStatus.querySelector(".save-status-label").textContent = storageAvailable
      ? (game ? "Spielstand lokal gespeichert" : "Speicherung im Browser aktiv")
      : "Speicherung nicht verfügbar";
  }

  function saveGame() {
    if (!game) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
    }
    updateSaveStatus();
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return validSavedGame(data) ? data : null;
    } catch (error) {
      return null;
    }
  }

  function clearSavedGame() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* Browser blockiert Speicher. */ }
  }

  function showRestoreToast() {
    restoreToast.textContent = "Dein gespeicherter Spielstand wurde wieder hergestellt";
    restoreToast.hidden = false;
    window.setTimeout(() => { restoreToast.hidden = true; }, 3500);
  }

  // Nur die aktive Zeit bei einer angezeigten Frage wird gezählt.
  // Während einer Rundenpause, nach einer Antwort und bei verborgenem Tab pausiert die Uhr.
  function syncClock() {
    if (!game || game.phase !== "question" || clockAnchor === null) return;
    const now = performance.now();
    const delta = Math.max(0, now - clockAnchor);
    game.elapsedMs += delta;
    game.questionElapsedMs += delta;
    clockAnchor = now;
  }

  function pauseClock() {
    syncClock();
    clockAnchor = null;
    if (game) saveGame();
  }

  function resumeClock() {
    if (game && game.phase === "question" && !document.hidden && clockAnchor === null) {
      clockAnchor = performance.now();
    }
  }

  function renderWelcome() {
    const options = [ALL_CATEGORIES, ...categories];
    app.innerHTML = `
      <div class="welcome-layout">
        <section class="welcome-hero">
          <span class="eyebrow">Bereit f&uuml;r die Herausforderung?</span>
          <h1>15 Fragen.<br><span class="blue-text">Drei Runden.</span></h1>
          <p>Teste dein Wissen, steigere die Schwierigkeit und bringe deinen einen Joker im richtigen Moment ins Spiel.</p>
          <div class="hero-highlights"><span>15 Fragen</span><span>3 Chancen</span><span>1 Joker</span></div>
        </section>
        <aside class="rules-card" aria-label="Spielregeln">
          <h2 class="rules-title">So funktioniert's</h2>
          ${ROUNDS.map((r, i) => `
            <div class="rule-line">
              <span class="rule-index">0${i + 1}</span>
              <span class="rule-copy"><strong>${html(r.label)}</strong><span>5 Fragen &middot; Runde ${i + 1}</span></span>
            </div>`).join("")}
          <p class="rules-foot">Jede Frage hat vier Antworten. Mit dem <strong>50:50-Joker</strong> verschwinden zwei falsche. Beim <strong>3. Fehler</strong> endet das Spiel.</p>
        </aside>
      </div>
      <section class="category-card" aria-labelledby="category-title">
        <div class="category-heading">
          <div><h2 id="category-title">Kategorie w&auml;hlen</h2><p>Ein Thema oder ein Mix aus allen Bereichen.</p></div>
          <span class="category-count">${categories.length} Themen verf&uuml;gbar</span>
        </div>
        <div class="category-grid" role="group" aria-label="Quiz-Kategorie">
          ${options.map((category) => `
            <button type="button" class="category-choice ${category === selectedCategory ? "is-selected" : ""}"
              data-action="category" data-category="${html(category)}" aria-pressed="${category === selectedCategory}">
              ${html(category)}
            </button>`).join("")}
        </div>
        <div class="start-actions">
          <span class="start-note">Antworten werden gemischt; zuletzt beantwortete Fragen bleiben f&uuml;r mehrere Spiele gesperrt.<br>Spielstand und Fragenverlauf bleiben in diesem Browser gespeichert.</span>
          <button class="button button--primary" type="button" data-action="start">Quiz starten <span class="button-arrow" aria-hidden="true">&rarr;</span></button>
        </div>
      </section>
    `;
  }

  function startNewGame() {
    const questionIds = ROUNDS.flatMap((round) => chooseQuestions(round, selectedCategory));
    if (questionIds.length !== TOTAL_QUESTIONS) {
      app.innerHTML = "<p>F&uuml;r die gew&auml;hlte Kategorie sind nicht gen&uuml;gend Fragen vorhanden.</p>";
      return;
    }

    game = {
      version: STORAGE_VERSION,
      category: selectedCategory,
      questionIds,
      answerOrders: createAnswerOrders(questionIds),
      index: 0,
      phase: "question",
      mistakes: 0,
      elapsedMs: 0,
      questionElapsedMs: 0,
      joker: { used: false, questionId: null, hiddenIndices: [] },
      answers: [],
      endReason: null
    };
    clockAnchor = null;
    lastSavedSecond = -1;
    saveGame();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    resumeClock();
  }

  function currentQuestion() {
    return game ? questionMap.get(game.questionIds[game.index]) : null;
  }

  function gameHeader() {
    const roundIndex = Math.floor(game.index / QUESTIONS_PER_ROUND);
    const remaining = MAX_MISTAKES - game.mistakes;
    return `
      <div class="game-header">
        <div class="game-header-top">
          <div class="game-heading">
            <div class="game-heading-title-row">
              <h2>Runde ${roundIndex + 1} <span class="blue-text">/ ${html(ROUNDS[roundIndex].label)}</span></h2>
              <button type="button" class="button button--ghost button--small game-heading-reset" data-action="restart">Neues Spiel</button>
            </div>
            <span class="subheading">${html(game.category)} &middot; Frage ${game.index + 1} von ${TOTAL_QUESTIONS}</span>
            <div class="progress-rail" role="progressbar" aria-label="Beantwortete Fragen" aria-valuemin="0" aria-valuemax="${TOTAL_QUESTIONS}" aria-valuenow="${game.answers.length}">
              <div class="progress-fill" style="width:${100 * game.answers.length / TOTAL_QUESTIONS}%"></div>
            </div>
          </div>
          <div class="game-meta">
            <div class="meta-stat"><small>Zeit</small><strong id="live-timer">${formatTime(game.elapsedMs)}</strong></div>
            <div class="game-meta-actions">
              <div class="meta-stat meta-stat--chances" aria-label="Noch ${remaining} Fehlversuche">
                <small>Chancen</small><span class="life-dots" aria-hidden="true">
                  ${Array.from({ length: MAX_MISTAKES }, (_, index) => `<span class="life-dot ${index >= remaining ? "is-empty" : ""}"></span>`).join("")}
                </span><strong class="chance-count">${remaining}/${MAX_MISTAKES}</strong>
              </div>
              <button type="button" class="joker-button" data-action="joker" ${game.joker.used || game.phase !== "question" ? "disabled" : ""}
                aria-label="50:50-Joker ${game.joker.used ? "bereits verwendet" : "einsetzen"}">
                <span class="joker-icon">50:50</span><span>Joker</span>
              </button>
            </div>
          </div>
        </div>
        <div class="round-tabs" aria-label="Rundenfortschritt">
          ${ROUNDS.map((round, index) => {
            const complete = game.answers.length >= (index + 1) * QUESTIONS_PER_ROUND;
            return `<div class="round-tab ${complete ? "is-complete" : (roundIndex === index ? "is-active" : "")}">
              <span class="round-tab-number">${complete ? "&#10003;" : `0${index + 1}`}</span>
              <span class="round-tab-copy"><small>Runde 0${index + 1}</small><strong>${html(round.label)}</strong></span>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderQuestion() {
    const q = currentQuestion();
    const locked = game.phase === "feedback";
    const answer = locked ? game.answers[game.answers.length - 1] : null;
    const hiddenIndices = game.joker.used && game.joker.questionId === q.id ? game.joker.hiddenIndices : [];
    const letters = ["A", "B", "C", "D"];

    const answersMarkup = answerOrder(q).map((originalIndex, index) => {
      const option = q.answers[originalIndex];
      const removed = hiddenIndices.includes(originalIndex);
      let stateClass = "";
      let mark = "";
      if (removed) stateClass = "is-removed";
      else if (locked && originalIndex === q.correctIndex) { stateClass = "is-correct"; mark = "&#10003;"; }
      else if (locked && originalIndex === answer.selectedIndex) { stateClass = "is-wrong"; mark = "&#10005;"; }
      else if (locked) stateClass = "is-neutral";

      return `<button type="button" class="answer ${stateClass}" data-action="answer" data-index="${index}"
        ${removed || locked ? "disabled" : ""} aria-label="Antwort ${letters[index]}: ${html(removed ? "Entfällt durch Joker" : option)}">
        <span class="answer-letter">${letters[index]}</span>
        <span class="answer-text">${removed ? "Entf&auml;llt durch 50:50" : html(option)}</span>
        ${mark ? `<span class="answer-mark" aria-hidden="true">${mark}</span>` : ""}
      </button>`;
    }).join("");

    let feedback = "";
    if (locked) {
      const correct = answer.correct;
      feedback = `<div class="feedback ${correct ? "" : "is-wrong"}" id="feedback-panel" tabindex="-1" role="status">
        <div class="feedback-icon" aria-hidden="true">${correct ? "&#10003;" : "&#10005;"}</div>
        <div>
          <strong>${correct ? "Richtig beantwortet!" : "Nicht ganz richtig."}</strong>
          <p>${correct ? "" : `Richtig ist: <b>${html(q.answers[q.correctIndex])}</b>. `}${html(q.explanation || "")}</p>
        </div>
      </div>`;
    }

    return `<div class="game-container">
      ${gameHeader()}
      <section class="question-card" aria-labelledby="question-heading">
        <div class="question-tagline">
          <span class="question-number">FRAGE ${String(game.index + 1).padStart(2, "0")}</span>
          <span class="pill pill--blue">${html(q.category)}</span>
        </div>
        <h1 id="question-heading" tabindex="-1">${html(q.question)}</h1>
        <p class="question-subtext">W&auml;hle eine der vier Antworten.</p>
        <div class="answers-grid" role="group" aria-label="Antworten">
          ${answersMarkup}
        </div>
        ${feedback}
        <div class="question-actions">
          ${locked
            ? '<button type="button" class="button button--primary" data-action="next">Weiter <span class="button-arrow" aria-hidden="true">&rarr;</span></button>'
            : '<p class="keyboard-hint">Tasten 1-4: Antwort &middot; J: Joker</p>'}
        </div>
      </section>
    </div>`;
  }

  function renderRoundIntro() {
    const roundIndex = Math.floor(game.index / QUESTIONS_PER_ROUND);
    const round = ROUNDS[roundIndex];
    return `<section class="round-intro-card" aria-labelledby="round-heading">
      <span class="eyebrow">Runde ${roundIndex + 1} von 3 &middot; ${html(round.label)}</span>
      <h1 id="round-heading" tabindex="-1">${html(round.title)}<br><span class="blue-text">Weiter geht's.</span></h1>
      <p>${html(round.description)} Die Uhr startet erst, wenn du die n&auml;chste Runde beginnst.</p>
      <div class="intermission-stats">
        <div class="intermission-stat"><strong>${game.answers.length}/15</strong><small>Beantwortet</small></div>
        <div class="intermission-stat"><strong>${game.mistakes}/3</strong><small>Fehler</small></div>
        <div class="intermission-stat"><strong>${formatTime(game.elapsedMs)}</strong><small>Spielzeit</small></div>
      </div>
      <button type="button" class="button button--primary" data-action="begin-round">Runde ${roundIndex + 1} starten <span class="button-arrow" aria-hidden="true">&rarr;</span></button>
    </section>`;
  }

  function renderResults() {
    const completed = game.endReason === "completed";
    const correctCount = game.answers.length - game.mistakes;
    const longest = game.answers.reduce((best, answer, index) =>
      !best || answer.elapsedMs > best.answer.elapsedMs ? { answer, index } : best, null);
    const longestQuestion = longest ? questionMap.get(longest.answer.id) : null;
    const jokerQuestion = game.joker.used ? questionMap.get(game.joker.questionId) : null;
    const jokerNumber = game.joker.used ? game.questionIds.indexOf(game.joker.questionId) + 1 : null;

    return `<div class="results-container">
      <section class="result-hero" aria-labelledby="results-heading">
        <span class="result-state"><span class="result-state-icon" aria-hidden="true">${completed ? "&#10003;" : "&#10005;"}</span> Auswertung</span>
        <h1 id="results-heading" tabindex="-1">${completed ? "Alle drei Runden geschafft." : "Drei Fehler. Spiel beendet."}</h1>
        <p class="result-description">${completed
          ? `Du hast alle 15 Fragen in der Kategorie <b>${html(game.category)}</b> beantwortet. Hier ist deine Bilanz.`
          : `Beim dritten Fehler endet dein Versuch. Du hast <b>${game.answers.length} von 15 Fragen</b> in der Kategorie <b>${html(game.category)}</b> beantwortet.`}</p>
        <div class="result-stats">
          <div class="result-stat"><strong>${formatTime(game.elapsedMs)}</strong><small>Gesamte Spielzeit</small></div>
          <div class="result-stat"><strong>${game.mistakes}</strong><small>Fehler</small></div>
          <div class="result-stat"><strong>${correctCount}</strong><small>Richtige Antworten</small></div>
          <div class="result-stat"><strong>${game.answers.length}/15</strong><small>Fragen gespielt</small></div>
        </div>
      </section>
      <section class="insights-grid" aria-label="Weitere Statistiken">
        <article class="insight-card">
          <p class="insight-label">Am l&auml;ngsten &uuml;berlegt</p>
          ${longest ? `
            <h2>Frage ${String(longest.index + 1).padStart(2, "0")} &middot; <span class="insight-value">${formatTime(longest.answer.elapsedMs)}</span></h2>
            <p>${html(longestQuestion.question)}</p>` : '<h2>Keine Antworten</h2>'}
        </article>
        <article class="insight-card">
          <p class="insight-label">50:50-Joker</p>
          ${jokerQuestion ? `
            <h2>Bei Frage ${String(jokerNumber).padStart(2, "0")} eingesetzt</h2>
            <p>${html(jokerQuestion.category)} &middot; ${html(jokerQuestion.question)}</p>`
            : '<h2>Nicht eingesetzt</h2><p>Der 50:50-Joker wurde in diesem Spiel nicht verwendet.</p>'}
        </article>
      </section>
      <details class="history-card">
        <summary>Alle Antworten ansehen (${game.answers.length})</summary>
        <div class="history-list">
          ${game.answers.map((entry, index) => {
            const q = questionMap.get(entry.id);
            return `<div class="history-row">
              <span class="history-outcome ${entry.correct ? "" : "is-wrong"}" aria-label="${entry.correct ? "Richtig" : "Falsch"}">${entry.correct ? "&#10003;" : "&#10005;"}</span>
              <span class="history-copy"><strong>${index + 1}. ${html(q.question)}</strong>
              <small>${html(q.category)} &middot; ${html(ROUNDS[Math.floor(index / QUESTIONS_PER_ROUND)].label)}${entry.correct ? "" : ` &middot; Richtige Antwort: ${html(q.answers[q.correctIndex])}`}${entry.usedJoker ? " &middot; Mit Joker" : ""}</small></span>
              <span class="history-time">${formatTime(entry.elapsedMs)}</span>
            </div>`;
          }).join("")}
        </div>
      </details>
      <div class="result-actions">
        <p>Die Zeit erfasst die aktiven Antwortphasen.</p>
        <button type="button" class="button button--primary" data-action="restart">Neues Quiz starten <span class="button-arrow" aria-hidden="true">&rarr;</span></button>
      </div>
    </div>`;
  }

  function render() {
    resetButton.hidden = !game;
    if (!game) { document.title = "Quizlab - Das Wissensquiz"; renderWelcome(); return; }
    if (game.phase === "finished") {
      document.title = "Dein Ergebnis - Quizlab";
      app.innerHTML = renderResults();
    } else if (game.phase === "roundIntro") {
      document.title = "Neue Runde - Quizlab";
      app.innerHTML = renderRoundIntro();
    } else {
      document.title = `Frage ${game.index + 1} - Quizlab`;
      app.innerHTML = renderQuestion();
    }
  }

  function answerQuestion(index) {
    if (!game || game.phase !== "question" || !Number.isInteger(index) || index < 0 || index > 3) return;
    const q = currentQuestion();
    const originalIndex = answerOrder(q)[index];
    if (game.joker.used && game.joker.questionId === q.id && game.joker.hiddenIndices.includes(originalIndex)) return;

    syncClock();
    clockAnchor = null;
    const correct = originalIndex === q.correctIndex;
    game.answers.push({
      id: q.id,
      selectedIndex: originalIndex,
      correct,
      elapsedMs: Math.round(game.questionElapsedMs),
      usedJoker: game.joker.used && game.joker.questionId === q.id
    });
    rememberAnsweredQuestion(q.id);
    game.questionElapsedMs = 0;
    if (!correct) game.mistakes += 1;

    if (game.mistakes >= MAX_MISTAKES) {
      game.phase = "finished";
      game.endReason = "mistakes";
    } else if (game.answers.length >= TOTAL_QUESTIONS) {
      game.phase = "finished";
      game.endReason = "completed";
    } else {
      game.phase = "feedback";
    }
    saveGame();
    render();
    if (game.phase === "feedback") document.getElementById("feedback-panel")?.focus({ preventScroll: false });
    else document.getElementById("results-heading")?.focus({ preventScroll: false });
  }

  function useJoker() {
    if (!game || game.phase !== "question" || game.joker.used) return;
    const q = currentQuestion();
    syncClock();
    const wrongIndices = [0, 1, 2, 3].filter((index) => index !== q.correctIndex);
    game.joker = {
      used: true,
      questionId: q.id,
      hiddenIndices: shuffle(wrongIndices).slice(0, 2)
    };
    saveGame();
    render();
    document.getElementById("question-heading")?.focus({ preventScroll: true });
  }

  function nextQuestion() {
    if (!game || game.phase !== "feedback") return;
    game.index += 1;
    game.questionElapsedMs = 0;
    game.phase = game.index % QUESTIONS_PER_ROUND === 0 ? "roundIntro" : "question";
    saveGame();
    render();
    resumeClock();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function beginRound() {
    if (!game || game.phase !== "roundIntro") return;
    game.phase = "question";
    game.questionElapsedMs = 0;
    saveGame();
    render();
    resumeClock();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restartGame() {
    if (game && game.phase !== "finished" &&
        !window.confirm("Möchtest du das aktuelle Spiel wirklich verwerfen und neu beginnen?")) return;
    if (game) selectedCategory = game.category;
    clockAnchor = null;
    game = null;
    clearSavedGame();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !app.contains(button) || button.disabled) return;
    const action = button.dataset.action;
    if (action === "category") {
      const choice = button.dataset.category;
      if (choice === ALL_CATEGORIES || categories.includes(choice)) {
        selectedCategory = choice;
        renderWelcome();
        [...app.querySelectorAll('[data-action="category"]')]
          .find((item) => item.dataset.category === choice)?.focus({ preventScroll: true });
      }
    } else if (action === "start") startNewGame();
    else if (action === "answer") answerQuestion(Number(button.dataset.index));
    else if (action === "joker") useJoker();
    else if (action === "next") nextQuestion();
    else if (action === "begin-round") beginRound();
    else if (action === "restart") restartGame();
  });

  resetButton.addEventListener("click", restartGame);

  // PWA: optionaler Installationsknopf, sobald der Browser Installation anbietet.
  const installButton = document.getElementById("install-button");
  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  installButton?.addEventListener("click", async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    installButton.hidden = true;
    await prompt.prompt();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  // Service Worker nur bei HTTPS bzw. localhost (nicht bei file://).
  if ("serviceWorker" in navigator && (location.protocol === "https:" ||
      ["localhost", "127.0.0.1"].includes(location.hostname))) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js")
        .catch((error) => console.warn("Offline-Modus nicht verfügbar:", error));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || !game) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if (game.phase === "question") {
      if (/^[1-4]$/.test(event.key)) answerQuestion(Number(event.key) - 1);
      else if (event.key.toLowerCase() === "j") useJoker();
    } else if (game.phase === "feedback" && event.key === "Enter" &&
               !["BUTTON", "A"].includes(document.activeElement?.tagName)) {
      nextQuestion();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseClock();
    else resumeClock();
  });
  window.addEventListener("pagehide", pauseClock);

  // Jede Sekunde sichern, damit auch nach versehentlichem Neuladen kaum Zeit verloren geht.
  window.setInterval(() => {
    if (!game || game.phase !== "question" || document.hidden) return;
    syncClock();
    const timer = document.getElementById("live-timer");
    if (timer) timer.textContent = formatTime(game.elapsedMs);
    const second = Math.floor(game.elapsedMs / 1000);
    if (second !== lastSavedSecond) {
      lastSavedSecond = second;
      saveGame();
    }
  }, 250);

  const catalogError = validateCatalog();
  if (catalogError) {
    app.innerHTML = `<section class="question-card"><h1>Quiz nicht startbereit</h1><p>${catalogError}</p><p>Bitte pr&uuml;fe die Datei questions.js.</p></section>`;
    resetButton.hidden = true;
    return;
  }
  game = loadGame();
  if (game && !game.answerOrders) {
    // Alte Speicherstände beibehalten: bereits beantwortete Fragen nicht umsortieren.
    const answeredIds = new Set(game.answers.map((answer) => answer.id));
    game.answerOrders = Object.fromEntries(game.questionIds.map((id) => [
      id, answeredIds.has(id) ? [0, 1, 2, 3] : shuffle([0, 1, 2, 3])
    ]));
    saveGame();
  }
  const restoredGame = Boolean(game && game.phase !== "finished");
  if (game) selectedCategory = game.category;
  updateSaveStatus();
  render();
  if (restoredGame) showRestoreToast();
  resumeClock();
})();
