const STORAGE = {
  theme: "ielts-browser.theme.v1",
  goals: "ielts-browser.goals.v1",
  vocab: "ielts-browser.vocab.v1",
  notes: "ielts-browser.notes.v1",
  lastPage: "ielts-browser.last-page.v1"
};

const skills = [
  { id: "reading", label: "Reading", minutes: 20 },
  { id: "listening", label: "Listening", minutes: 30 },
  { id: "writing", label: "Writing", minutes: 40 },
  { id: "speaking", label: "Speaking", minutes: 15 },
  { id: "vocab", label: "Vocabulary", minutes: 10 }
];

const resources = [
  {
    id: "home",
    skill: "reading",
    title: "IELTS Study Home",
    summary: "A focused browser-style workspace for IELTS practice, notes, vocabulary, and official resource links.",
    url: "ielts://home",
    tasks: ["Choose one skill module", "Finish one timed practice block", "Add three useful words or phrases", "Write one short mistake review"],
    tips: ["Practice first, then review. The timer is here to keep sessions exam-like.", "Track one weakness at a time so your review stays specific."],
    links: [
      ["British Council IELTS", "https://takeielts.britishcouncil.org/"],
      ["IELTS sample questions", "https://ielts.org/take-a-test/preparation-resources/sample-test-questions"]
    ]
  },
  {
    id: "reading-skimming",
    skill: "reading",
    title: "Reading: Skimming and Scanning",
    summary: "Build a reliable reading order: map the passage first, then locate answers with keywords and paraphrases.",
    url: "ielts://reading/skimming",
    tasks: ["Spend three minutes on headings, first sentences, and contrast words", "Label the function of each paragraph", "Locate eight answers using keywords", "Review every wrong location"],
    tips: ["Do not deep-read the whole passage before seeing the questions.", "For matching tasks, watch names, numbers, negatives, and topic nouns."],
    links: [["Official reading samples", "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-reading-sample-test-questions"]]
  },
  {
    id: "listening-signals",
    skill: "listening",
    title: "Listening: Signal Words",
    summary: "Catch corrections, emphasis, and sequence markers in Sections 2 to 4.",
    url: "ielts://listening/signals",
    tasks: ["Preview questions and predict word forms", "First pass: mark answer positions only", "Second pass: write paraphrases", "Collect five signal expressions"],
    tips: ["Words like but, however, and actually often introduce a correction.", "For gap fills, predict whether the answer is a noun, verb, number, or adjective."],
    links: [["Official listening samples", "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/listening-sample-test-questions"]]
  },
  {
    id: "writing-task2",
    skill: "writing",
    title: "Writing: Task 2 Argument Builder",
    summary: "Turn a position, reason, example, and result into stable body paragraphs.",
    url: "ielts://writing/task-2",
    tasks: ["Identify the question type in two minutes", "Plan two topic sentences", "Write for thirty minutes", "Check linking, articles, and singular/plural forms"],
    tips: ["A useful body paragraph can follow topic sentence, reason, example, result.", "Examples do not need to be dramatic; they need to support the topic sentence."],
    links: [["Official writing samples", "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-writing-sample-test-questions"]]
  },
  {
    id: "speaking-part2",
    skill: "speaking",
    title: "Speaking: Part 2 Cue Card",
    summary: "Reuse material across people, places, events, and objects without sounding memorized.",
    url: "ielts://speaking/part-2",
    tasks: ["Write keywords for one minute", "Record a two-minute answer", "Replay and mark pauses", "Replace three repeated words"],
    tips: ["Prepare a story line: background, conflict, detail, feeling.", "Natural expansion is more useful than memorizing complicated sentences."],
    links: [["Official speaking samples", "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/speaking-sample-test-questions"]]
  },
  {
    id: "vocab-paraphrase",
    skill: "vocab",
    title: "Vocabulary: Paraphrase Training",
    summary: "IELTS reading and listening depend heavily on recognizing the same idea in a different wording.",
    url: "ielts://vocab/paraphrase",
    tasks: ["Pick ten keywords from mistakes", "Write two paraphrases for each", "Create one IELTS topic sentence", "Review again tomorrow"],
    tips: ["Do not only memorize translations. Learn collocations and context.", "Group paraphrases by themes such as education, environment, technology, and work."],
    links: [["Cambridge Dictionary", "https://dictionary.cambridge.org/"]]
  }
];

const defaultGoals = [
  "Finish one timed reading or listening set",
  "Review three mistakes and write the reason",
  "Add three words, phrases, or paraphrases",
  "Prepare one reusable writing or speaking idea"
];

const els = {
  themeToggle: document.querySelector("#themeToggle"),
  goalList: document.querySelector("#goalList"),
  todayProgress: document.querySelector("#todayProgress"),
  skillTabs: document.querySelector("#skillTabs"),
  resourceCount: document.querySelector("#resourceCount"),
  resourceList: document.querySelector("#resourceList"),
  backButton: document.querySelector("#backButton"),
  forwardButton: document.querySelector("#forwardButton"),
  homeButton: document.querySelector("#homeButton"),
  addressForm: document.querySelector("#addressForm"),
  addressInput: document.querySelector("#addressInput"),
  pageView: document.querySelector("#pageView"),
  timerMode: document.querySelector("#timerMode"),
  timerDisplay: document.querySelector("#timerDisplay"),
  timerMinus: document.querySelector("#timerMinus"),
  timerToggle: document.querySelector("#timerToggle"),
  timerPlus: document.querySelector("#timerPlus"),
  vocabForm: document.querySelector("#vocabForm"),
  wordInput: document.querySelector("#wordInput"),
  meaningInput: document.querySelector("#meaningInput"),
  vocabCount: document.querySelector("#vocabCount"),
  vocabList: document.querySelector("#vocabList"),
  notesInput: document.querySelector("#notesInput"),
  saveState: document.querySelector("#saveState"),
  toast: document.querySelector("#toast")
};

let activeSkill = "reading";
let currentResourceId = localStorage.getItem(STORAGE.lastPage) || "home";
let historyStack = [currentResourceId];
let historyIndex = 0;
let vocab = readJson(STORAGE.vocab, []);
let timerSeconds = 20 * 60;
let timerId = null;
let notesTimer = null;

init();

function init() {
  applyTheme(localStorage.getItem(STORAGE.theme) || "light");
  els.notesInput.value = localStorage.getItem(STORAGE.notes) || "";
  bindEvents();
  renderGoals();
  renderSkills();
  renderResources();
  renderVocab();
  navigate(currentResourceId, false);
}

function bindEvents() {
  els.themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE.theme, next);
  });

  els.addressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = els.addressInput.value.trim();
    if (!value) return;
    const matched = findResource(value);
    if (matched) {
      navigate(matched.id);
    } else if (looksLikeUrl(value)) {
      window.open(normalizeUrl(value), "_blank", "noopener");
      showToast("Opened external website in a new tab");
    } else {
      renderSearch(value);
    }
  });

  els.backButton.addEventListener("click", () => {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    navigate(historyStack[historyIndex], false);
  });

  els.forwardButton.addEventListener("click", () => {
    if (historyIndex >= historyStack.length - 1) return;
    historyIndex += 1;
    navigate(historyStack[historyIndex], false);
  });

  els.homeButton.addEventListener("click", () => navigate("home"));
  els.timerMinus.addEventListener("click", () => adjustTimer(-5));
  els.timerPlus.addEventListener("click", () => adjustTimer(5));
  els.timerToggle.addEventListener("click", toggleTimer);
  els.vocabForm.addEventListener("submit", addVocab);

  els.notesInput.addEventListener("input", () => {
    els.saveState.textContent = "Saving";
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      localStorage.setItem(STORAGE.notes, els.notesInput.value);
      els.saveState.textContent = "Saved";
    }, 350);
  });
}

function renderGoals() {
  const states = readJson(STORAGE.goals, defaultGoals.map((text) => ({ text, done: false })));
  els.goalList.innerHTML = "";
  states.forEach((goal, index) => {
    const label = document.createElement("label");
    label.className = "goal-item";
    label.innerHTML = `<input type="checkbox" ${goal.done ? "checked" : ""}><span>${escapeHtml(goal.text)}</span>`;
    label.querySelector("input").addEventListener("change", (event) => {
      states[index].done = event.target.checked;
      localStorage.setItem(STORAGE.goals, JSON.stringify(states));
      updateGoalProgress(states);
    });
    els.goalList.appendChild(label);
  });
  updateGoalProgress(states);
}

function updateGoalProgress(states) {
  const done = states.filter((goal) => goal.done).length;
  els.todayProgress.textContent = `${done}/${states.length}`;
}

function renderSkills() {
  els.skillTabs.innerHTML = "";
  skills.forEach((skill) => {
    const count = resources.filter((resource) => resource.skill === skill.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skill-button${skill.id === activeSkill ? " active" : ""}`;
    button.innerHTML = `${skill.label}<span>${count} items</span>`;
    button.addEventListener("click", () => {
      activeSkill = skill.id;
      setTimer(skill.minutes, skill.label);
      renderSkills();
      renderResources();
    });
    els.skillTabs.appendChild(button);
  });
}

function renderResources() {
  const visible = resources.filter((resource) => resource.skill === activeSkill || resource.id === "home");
  els.resourceCount.textContent = `${visible.length} items`;
  els.resourceList.innerHTML = "";
  visible.forEach((resource) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `resource-card${resource.id === currentResourceId ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(resource.title)}</strong><p>${escapeHtml(resource.summary)}</p>`;
    button.addEventListener("click", () => navigate(resource.id));
    els.resourceList.appendChild(button);
  });
}

function navigate(resourceId, pushHistory = true) {
  const resource = resources.find((item) => item.id === resourceId) || resources[0];
  currentResourceId = resource.id;
  activeSkill = resource.skill;
  localStorage.setItem(STORAGE.lastPage, resource.id);
  els.addressInput.value = resource.url;

  if (pushHistory) {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(resource.id);
    historyIndex = historyStack.length - 1;
  }

  const skill = skills.find((item) => item.id === resource.skill);
  if (skill && !timerId) setTimer(skill.minutes, skill.label);
  renderPage(resource);
  renderSkills();
  renderResources();
  updateHistoryButtons();
}

function renderPage(resource) {
  els.pageView.innerHTML = `
    <article class="browser-page">
      <header class="page-hero">
        <h2>${escapeHtml(resource.title)}</h2>
        <p>${escapeHtml(resource.summary)}</p>
      </header>
      <div class="page-body">
        <div class="browser-grid">
          <section class="task-box">
            <h3>Practice flow</h3>
            <ul>${resource.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
          </section>
          <section class="info-box">
            <h3>Score tips</h3>
            ${resource.tips.map((tip) => `<p>${escapeHtml(tip)}</p>`).join("")}
          </section>
        </div>
        <section class="info-box">
          <h3>Recommended links</h3>
          <div class="link-row">
            ${resource.links.map(([label, href]) => `<a class="external-link" href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`).join("")}
          </div>
        </section>
      </div>
    </article>
  `;
  els.pageView.scrollTop = 0;
}

function renderSearch(query) {
  const results = resources.filter((resource) => {
    const text = `${resource.title} ${resource.summary} ${resource.tasks.join(" ")} ${resource.tips.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });
  els.pageView.innerHTML = `
    <article class="browser-page">
      <header class="page-hero">
        <h2>Search: ${escapeHtml(query)}</h2>
        <p>Found ${results.length} local IELTS resources. URLs open in a new browser tab.</p>
      </header>
      <div class="page-body">
        ${results.length ? results.map((resource) => `
          <button class="resource-card" type="button" data-id="${resource.id}">
            <strong>${escapeHtml(resource.title)}</strong>
            <p>${escapeHtml(resource.summary)}</p>
          </button>
        `).join("") : `<section class="info-box"><h3>No matches</h3><p>Try reading, listening, task 2, part 2, signal words, or paraphrase.</p></section>`}
      </div>
    </article>
  `;
  els.pageView.scrollTop = 0;
  els.pageView.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.id));
  });
}

function setTimer(minutes, label) {
  timerSeconds = minutes * 60;
  els.timerMode.textContent = label;
  renderTimer();
}

function adjustTimer(deltaMinutes) {
  timerSeconds = Math.max(60, timerSeconds + deltaMinutes * 60);
  renderTimer();
}

function toggleTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    els.timerToggle.textContent = "Resume";
    return;
  }
  els.timerToggle.textContent = "Pause";
  timerId = setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      timerSeconds = 0;
      els.timerToggle.textContent = "Start";
      showToast("Time is up. Review your mistakes now.");
    }
    renderTimer();
  }, 1000);
}

function renderTimer() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const seconds = String(timerSeconds % 60).padStart(2, "0");
  els.timerDisplay.textContent = `${minutes}:${seconds}`;
}

function addVocab(event) {
  event.preventDefault();
  const word = els.wordInput.value.trim();
  const meaning = els.meaningInput.value.trim();
  if (!word) return;
  vocab.unshift({ id: crypto.randomUUID(), word, meaning });
  localStorage.setItem(STORAGE.vocab, JSON.stringify(vocab));
  els.vocabForm.reset();
  renderVocab();
}

function renderVocab() {
  els.vocabCount.textContent = `${vocab.length} words`;
  els.vocabList.innerHTML = "";
  if (!vocab.length) {
    els.vocabList.innerHTML = `<div class="vocab-chip"><div><strong>No words yet</strong><span>Add paraphrases from your mistakes.</span></div></div>`;
    return;
  }
  vocab.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "vocab-chip";
    chip.innerHTML = `
      <div><strong>${escapeHtml(item.word)}</strong><span>${escapeHtml(item.meaning || "No meaning yet")}</span></div>
      <button type="button" aria-label="Delete ${escapeHtml(item.word)}">x</button>
    `;
    chip.querySelector("button").addEventListener("click", () => {
      vocab = vocab.filter((word) => word.id !== item.id);
      localStorage.setItem(STORAGE.vocab, JSON.stringify(vocab));
      renderVocab();
    });
    els.vocabList.appendChild(chip);
  });
}

function findResource(value) {
  const normalized = value.toLowerCase();
  return resources.find((resource) => (
    resource.url.toLowerCase() === normalized ||
    resource.title.toLowerCase().includes(normalized) ||
    resource.skill.toLowerCase() === normalized
  ));
}

function looksLikeUrl(value) {
  return /^(https?:\/\/|www\.)/i.test(value) || /^[\w-]+\.[a-z]{2,}/i.test(value);
}

function normalizeUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function updateHistoryButtons() {
  els.backButton.disabled = historyIndex <= 0;
  els.forwardButton.disabled = historyIndex >= historyStack.length - 1;
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
