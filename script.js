// BEAM THE TRUTH: a friendly fact/myth quiz from the Pink Planet Collective.
// All statements are written to be affirming, medically accurate, and stigma-free.

const ROUNDS = [
  {
    text: "HIV can be spread by sharing a cup, a hug, or a toilet seat.",
    isFact: false,
    explain:
      "HIV is not spread through casual contact. It's transmitted through specific body fluids, and never through hugs, handshakes, cups, or toilet seats."
  },
  {
    text: "People living with HIV who have an undetectable viral load cannot transmit HIV sexually. (U=U)",
    isFact: true,
    explain:
      "This is the science-backed reality known as U=U: Undetectable = Untransmittable. Treatment works, and it changes lives."
  },
  {
    text: "PrEP is a daily medication that is ~99% effective at preventing HIV from sex when taken as prescribed.",
    isFact: true,
    explain:
      "PrEP (pre-exposure prophylaxis) is a big part of modern HIV prevention. Talk to a clinician to see if it's right for you."
  },
  {
    text: "Only people in certain groups need to think about sexual health.",
    isFact: false,
    explain:
      "Sexual health is part of overall health. It belongs in normal checkups, same as anything else."
  },
  {
    text: "Many STIs are either curable or very manageable when treated early.",
    isFact: true,
    explain:
      "Chlamydia, gonorrhea, and syphilis are curable with antibiotics. Others, like herpes and HIV, are highly manageable with modern care."
  },
  {
    text: "You should only get tested if you have symptoms.",
    isFact: false,
    explain:
      "Most STIs can show up with no symptoms at all. Routine testing is just good self-care, the same as a dental cleaning."
  },
  {
    text: "The HPV vaccine protects people of every gender.",
    isFact: true,
    explain:
      "HPV affects everyone, and the vaccine reduces risk of several cancers across all genders. The CDC recommends it through adulthood for many."
  },
  {
    text: "Consent has to be freely given, informed, and can be revoked at any time.",
    isFact: true,
    explain:
      "Consent is the bedrock of every healthy encounter. A handy shorthand is FRIES: freely given, reversible, informed, enthusiastic, specific. 🍟"
  }
];

// -------- Game state --------
const state = {
  order: [],
  index: 0,
  score: 0,
  streak: 0,
  active: false
};

// -------- DOM --------
const $ = (id) => document.getElementById(id);
const els = {
  score: $("score"),
  streak: $("streak"),
  progress: $("progress"),
  cardText: $("cardText"),
  gameCard: $("gameCard"),
  btnStart: $("btnStart"),
  btnFact: $("btnFact"),
  btnMyth: $("btnMyth"),
  feedback: $("feedback")
};

// -------- Helpers --------
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setControls({ answerEnabled, startLabel }) {
  els.btnFact.disabled = !answerEnabled;
  els.btnMyth.disabled = !answerEnabled;
  if (startLabel) els.btnStart.textContent = startLabel;
}

function renderHud() {
  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  els.progress.textContent = `${state.index} / ${ROUNDS.length}`;
}

function showRound() {
  const round = state.order[state.index];
  els.cardText.textContent = round.text;
  els.gameCard.style.transform = "scale(0.98)";
  requestAnimationFrame(() => {
    els.gameCard.style.transition = "transform 0.25s ease";
    els.gameCard.style.transform = "scale(1)";
  });
  setControls({ answerEnabled: true });
  els.feedback.className = "game-feedback";
  els.feedback.innerHTML = '<span style="opacity:0.7;">Transmission received. Fact or myth?</span>';
}

function answer(userSaidFact) {
  if (!state.active) return;
  const round = state.order[state.index];
  const correct = userSaidFact === round.isFact;

  if (correct) {
    state.streak += 1;
    state.score += 10 + Math.min(state.streak - 1, 5) * 2;
    els.feedback.className = "game-feedback correct";
    els.feedback.innerHTML =
      `<span class="feedback-head">✨ Correct. That's a ${round.isFact ? "FACT" : "MYTH"}.</span>${round.explain}`;
  } else {
    state.streak = 0;
    els.feedback.className = "game-feedback wrong";
    els.feedback.innerHTML =
      `<span class="feedback-head">👽 Not quite. That one was a ${round.isFact ? "FACT" : "MYTH"}.</span>${round.explain}`;
  }

  state.index += 1;
  renderHud();
  setControls({ answerEnabled: false });

  if (state.index >= state.order.length) {
    endGame();
  } else {
    els.btnStart.textContent = "Next transmission →";
    els.btnStart.disabled = false;
  }
}

function endGame() {
  state.active = false;
  const total = state.order.length * 10;
  const pct = Math.round((state.score / (total + (state.order.length * 10))) * 100);
  const msg = state.score >= total * 0.75
    ? "🛸 Mission accomplished, earthling! You're one of us now."
    : state.score >= total * 0.4
      ? "💗 Great flight. A couple of signals to revisit. That's what we're here for."
      : "🌱 Every journey starts somewhere. Check the resources below for more great info!";

  els.cardText.innerHTML = `<div style="font-size:1.1em;">${msg}</div><div style="margin-top:0.6em;opacity:0.8;font-size:0.85em;">Final score: ${state.score}</div>`;
  els.btnStart.textContent = "Play again";
  els.btnStart.disabled = false;
  setControls({ answerEnabled: false });
}

function startGame() {
  if (state.index >= state.order.length || !state.active) {
    // Fresh run
    state.order = shuffle(ROUNDS);
    state.index = 0;
    state.score = 0;
    state.streak = 0;
    state.active = true;
  }
  renderHud();
  showRound();
  els.btnStart.textContent = "…";
  els.btnStart.disabled = true;
}

// -------- Wire up --------
els.btnStart.addEventListener("click", () => {
  if (state.active && state.index > 0 && state.index < state.order.length) {
    // "Next transmission"
    showRound();
    els.btnStart.textContent = "…";
    els.btnStart.disabled = true;
  } else {
    startGame();
  }
});

els.btnFact.addEventListener("click", () => answer(true));
els.btnMyth.addEventListener("click", () => answer(false));

// Keyboard shortcuts: F = Fact, M = Myth, Space = Next/Start
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key.toLowerCase() === "f" && !els.btnFact.disabled) answer(true);
  else if (e.key.toLowerCase() === "m" && !els.btnMyth.disabled) answer(false);
  else if (e.code === "Space" && !els.btnStart.disabled) {
    e.preventDefault();
    els.btnStart.click();
  }
});

// -------- Tiny extras: random star twinkles on nav logo click --------
document.querySelector(".logo")?.addEventListener("click", (e) => {
  // allow anchor default but add a flourish
  const alien = document.querySelector(".logo-alien");
  if (!alien) return;
  alien.style.transition = "transform 0.6s";
  alien.style.transform = "rotate(360deg)";
  setTimeout(() => { alien.style.transform = ""; }, 700);
});
