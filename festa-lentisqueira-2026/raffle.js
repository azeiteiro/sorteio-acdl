import { contests as contestsConfig } from "./tickets.js";

// ==================== STATE ====================
const contests = contestsConfig.map((c) => ({
  slug: c.slug,
  name: c.name,
  logo: c.logo,
  soldTicketsObject: c.soldTickets,
  ticketNumbers: Object.keys(c.soldTickets).map(Number),
  winner: null, // { ticketNumber } once drawn
  isAnimating: false,
}));

const state = {
  recordingMode: false,
  activeIndex: 0,
};

// ==================== UTILITIES ====================
function updateClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const now = new Date();
  const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const dateStr = now.toLocaleDateString('pt-PT', dateOpts);
  const timeStr = now.toLocaleTimeString('pt-PT', timeOpts);
  clockEl.textContent = `${dateStr} • ${timeStr}`;
}

function getRandomTicket(tickets) {
  return tickets[Math.floor(Math.random() * tickets.length)];
}

function getTicketGridEl(contest) {
  return document.getElementById(`ticket-grid-${contest.slug}`);
}

function getTicketEl(contest, ticketNumber) {
  const grid = getTicketGridEl(contest);
  if (!grid) return null;
  return grid.querySelector(`[data-ticket="${ticketNumber}"]`);
}

// ==================== COMPONENTS ====================
function createTicketElement(ticketNumber, isWinner = false) {
  const div = document.createElement("div");
  div.className = "ticket" + (isWinner ? " winner" : "");
  div.textContent = ticketNumber;
  div.dataset.ticket = ticketNumber;
  return div;
}

function createTicketGrid(contest) {
  const grid = getTicketGridEl(contest);
  if (!grid) return;
  grid.innerHTML = "";

  contest.ticketNumbers.forEach((ticketNum) => {
    const isWinner = contest.winner && contest.winner.ticketNumber === ticketNum;
    grid.appendChild(createTicketElement(ticketNum, isWinner));
  });
}

function updateWinnersDisplay(contest) {
  const winnersList = document.getElementById(`winners-list-${contest.slug}`);
  if (!winnersList) return;

  if (!contest.winner) {
    winnersList.innerHTML =
      '<div class="empty-winners">Sem vencedor ainda. Inicie o sorteio!</div>';
    return;
  }

  winnersList.innerHTML = "";
  const div = document.createElement("div");
  div.className = "winner-item first";
  div.innerHTML = `
        <span class="winner-ticket">#${contest.winner.ticketNumber} - ${contest.soldTicketsObject[contest.winner.ticketNumber]}</span>
        <span class="winner-prize">${contest.name}</span>
    `;
  winnersList.appendChild(div);
}

function updateSummaryItem(contest) {
  const winnerEl = document.getElementById(`summary-winner-${contest.slug}`);
  if (!winnerEl) return;

  if (!contest.winner) {
    winnerEl.textContent = "—";
    winnerEl.classList.remove("drawn");
    return;
  }

  winnerEl.textContent = `#${contest.winner.ticketNumber} - ${contest.soldTicketsObject[contest.winner.ticketNumber]}`;
  winnerEl.classList.add("drawn");
}

function updateDrawButton(contest) {
  const button = document.getElementById(`draw-button-${contest.slug}`);
  if (!button) return;

  if (contest.ticketNumbers.length === 0) {
    button.disabled = true;
    button.textContent = "Sem rifas disponíveis";
    return;
  }

  if (contest.winner) {
    button.disabled = true;
    button.textContent = "Vencedor já sorteado";
    return;
  }

  button.disabled = contest.isAnimating;
  button.textContent = contest.isAnimating
    ? "A sortear..."
    : `Sortear ${contest.name}`;
}

function showWinnerModal(contest, ticketNumber) {
  const modal = document.getElementById("winner-modal");
  const modalTicket = document.getElementById("modal-ticket");
  const modalName = document.getElementById("modal-name");
  const modalPrize = document.getElementById("modal-prize");

  modalTicket.textContent = `#${ticketNumber}`;
  modalName.textContent = contest.soldTicketsObject[ticketNumber];
  modalPrize.textContent = contest.name;
  modal.classList.add("show");

  // Auto-close in recording mode
  if (state.recordingMode) {
    setTimeout(() => closeModal(), 2500);
  }
}

function closeModal() {
  const modal = document.getElementById("winner-modal");
  modal.classList.remove("show");
}

function toggleRecordingMode() {
  state.recordingMode = !state.recordingMode;
  const indicator = document.getElementById("recording-indicator");

  if (state.recordingMode) {
    document.body.classList.add("recording-mode");
    indicator.classList.remove("hidden");
  } else {
    document.body.classList.remove("recording-mode");
    indicator.classList.add("hidden");
  }
}

// ==================== ANIMATION ====================
function animateSelection(contest, callback) {
  const availableTickets = contest.ticketNumbers;
  if (availableTickets.length === 0) {
    callback(null);
    return;
  }

  const duration = state.recordingMode ? 4000 : 9000; // 4s in recording mode, 9s normal
  const startTime = Date.now();
  let lastHighlighted = null;
  const currentNumberDisplay = document.getElementById(`current-number-${contest.slug}`);

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    // Remove previous highlight
    if (lastHighlighted) {
      lastHighlighted.classList.remove("highlight");
    }

    if (progress >= 1) {
      // Animation complete, select winner
      const winner = getRandomTicket(availableTickets);
      currentNumberDisplay.textContent = `#${winner}`;
      setTimeout(() => {
        currentNumberDisplay.textContent = "?";
        callback(winner);
      }, 500);
      return;
    }

    // Calculate delay (increases as animation progresses)
    const baseDelay = 50;
    const maxDelay = 500;
    const delay = baseDelay + (maxDelay - baseDelay) * Math.pow(progress, 3);

    // Highlight random available ticket (scoped to this contest's grid)
    const randomTicket = getRandomTicket(availableTickets);
    const ticketElement = getTicketEl(contest, randomTicket);
    if (ticketElement) {
      ticketElement.classList.add("highlight");
      lastHighlighted = ticketElement;
      // Update current number display
      currentNumberDisplay.textContent = `#${randomTicket}`;
    }

    setTimeout(() => requestAnimationFrame(animate), delay);
  }

  animate();
}

// ==================== EVENT HANDLERS ====================
function handleDrawClick(contest) {
  if (contest.isAnimating) return;
  if (contest.winner) return;
  if (contest.ticketNumbers.length === 0) return;

  contest.isAnimating = true;
  updateDrawButton(contest);

  animateSelection(contest, (winningTicket) => {
    contest.isAnimating = false;

    if (winningTicket === null) {
      updateDrawButton(contest);
      alert("Não há rifas disponíveis!");
      return;
    }

    // Record winner
    contest.winner = { ticketNumber: winningTicket };

    // Update UI
    const ticketElement = getTicketEl(contest, winningTicket);
    if (ticketElement) {
      ticketElement.classList.add("winner");
      ticketElement.classList.remove("highlight");
    }

    updateWinnersDisplay(contest);
    updateDrawButton(contest);
    updateSummaryItem(contest);
    showWinnerModal(contest, winningTicket);
  });
}

// ==================== RENDERING ====================
function renderWinnersSummary() {
  const summary = document.getElementById("winners-summary");
  summary.innerHTML = contests
    .map(
      (contest) => `
    <div class="summary-item">
      <img src="${contest.logo}" alt="${contest.name}" class="summary-logo" />
      <span class="summary-name">${contest.name}</span>
      <span id="summary-winner-${contest.slug}" class="summary-winner">—</span>
    </div>
  `,
    )
    .join("");
}

function renderContestSection(contest) {
  const section = document.createElement("div");
  section.className = "contest-section";
  section.innerHTML = `
    <h2 class="contest-heading">
      <img src="${contest.logo}" alt="${contest.name}" class="contest-logo" />
      <span>${contest.name}</span>
    </h2>

    <div class="winners-section">
      <h2>🏆 Vencedor</h2>
      <div id="winners-list-${contest.slug}" class="winners-list">
        <div class="empty-winners">Sem vencedor ainda. Inicie o sorteio!</div>
      </div>
    </div>

    <div class="control-section">
      <button id="draw-button-${contest.slug}" class="draw-button">
        Sortear ${contest.name}
      </button>
      <div id="current-number-${contest.slug}" class="current-number">?</div>
    </div>

    <div class="grid-section">
      <h2 id="tickets-heading-${contest.slug}">🎫 Rifas Vendidas</h2>
      <div id="ticket-grid-${contest.slug}" class="ticket-grid"></div>
    </div>
  `;
  contest.sectionEl = section;
  return section;
}

function updateCarousel() {
  contests.forEach((contest, index) => {
    contest.sectionEl.classList.toggle("active", index === state.activeIndex);
  });
}

function goToContest(delta) {
  const count = contests.length;
  state.activeIndex = (state.activeIndex + delta + count) % count;
  updateCarousel();
}

// ==================== INITIALIZATION ====================
function init() {
  updateClock();
  setInterval(updateClock, 1000);

  renderWinnersSummary();

  const container = document.getElementById("contests-container");
  contests.forEach((contest) => {
    container.appendChild(renderContestSection(contest));

    createTicketGrid(contest);
    updateWinnersDisplay(contest);
    updateDrawButton(contest);
    updateSummaryItem(contest);

    document.getElementById(`tickets-heading-${contest.slug}`).textContent =
      `🎫 Rifas Vendidas (${contest.ticketNumbers.length})`;

    document
      .getElementById(`draw-button-${contest.slug}`)
      .addEventListener("click", () => handleDrawClick(contest));
  });

  updateCarousel();

  document
    .getElementById("carousel-prev")
    .addEventListener("click", () => goToContest(-1));
  document
    .getElementById("carousel-next")
    .addEventListener("click", () => goToContest(1));

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("winner-modal").addEventListener("click", (e) => {
    if (e.target.id === "winner-modal") closeModal();
  });
  document
    .getElementById("recording-toggle")
    .addEventListener("change", toggleRecordingMode);
}

// Start the app
init();
