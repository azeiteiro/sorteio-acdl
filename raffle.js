import { soldTickets, prizeDescriptions } from "./tickets.js";

// ==================== STATE ====================
const state = {
  soldTicketsObject: soldTickets,
  soldTickets: Object.keys(soldTickets).map(Number),
  prizeDescriptions,
  winners: [],
  currentPrize: 0,
  isAnimating: false,
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

function getAvailableTickets() {
  const wonTickets = state.winners.map((w) => w.ticketNumber);
  return state.soldTickets.filter((t) => !wonTickets.includes(t));
}

function getRandomTicket(tickets) {
  return tickets[Math.floor(Math.random() * tickets.length)];
}

// ==================== COMPONENTS ====================
function createTicketElement(ticketNumber, isWinner = false) {
  const div = document.createElement("div");
  div.className = "ticket" + (isWinner ? " winner" : "");
  div.textContent = ticketNumber;
  div.dataset.ticket = ticketNumber;
  return div;
}

function createTicketGrid() {
  const grid = document.getElementById("ticket-grid");
  grid.innerHTML = "";

  state.soldTickets.forEach((ticketNum) => {
    const isWinner = state.winners.some((w) => w.ticketNumber === ticketNum);
    grid.appendChild(createTicketElement(ticketNum, isWinner));
  });
}

function updateWinnersDisplay() {
  const winnersList = document.getElementById("winners-list");

  if (state.winners.length === 0) {
    winnersList.innerHTML =
      '<div class="empty-winners">Ainda não há vencedores.</div>';
    return;
  }

  winnersList.innerHTML = "";

  state.winners.forEach((winner) => {
    const div = document.createElement("div");
    // Assign class based on actual prize level, not draw order
    let prizeClass = "";
    if (winner.prize.includes("1º")) prizeClass = "first";
    else if (winner.prize.includes("2º")) prizeClass = "second";
    else if (winner.prize.includes("3º")) prizeClass = "third";

    div.className = `winner-item ${prizeClass}`;
    div.innerHTML = `
            <span class="winner-ticket">#${winner.ticketNumber} - ${state.soldTicketsObject[winner.ticketNumber]}</span>
            <span class="winner-prize">${winner.prize}</span>
        `;
    winnersList.appendChild(div);
  });
}

function updatePrizeStatus() {
  const status = document.getElementById("prize-status");
  if (state.currentPrize >= state.prizeDescriptions.length) {
    status.textContent = "Todos os prémios foram sorteados!";
  } else {
    status.textContent = `Próximo: ${state.prizeDescriptions[state.currentPrize]}`;
  }
}

function showWinnerModal(ticketNumber, prize) {
  const modal = document.getElementById("winner-modal");
  const modalTicket = document.getElementById("modal-ticket");
  const modalName = document.getElementById("modal-name");
  const modalPrize = document.getElementById("modal-prize");

  modalTicket.textContent = `#${ticketNumber}`;
  modalName.textContent = state.soldTicketsObject[ticketNumber];
  modalPrize.textContent = prize;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("winner-modal");
  modal.classList.remove("show");
}

// ==================== ANIMATION ====================
function animateSelection(callback) {
  const availableTickets = getAvailableTickets();
  if (availableTickets.length === 0) {
    callback(null);
    return;
  }

  const duration = 9000; // 9 seconds
  const startTime = Date.now();
  let lastHighlighted = null;
  const currentNumberDisplay = document.getElementById("current-number");

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

    // Highlight random available ticket
    const randomTicket = getRandomTicket(availableTickets);
    const ticketElement = document.querySelector(
      `[data-ticket="${randomTicket}"]`,
    );
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
function handleDrawClick() {
  if (state.isAnimating) return;
  if (state.currentPrize >= state.prizeDescriptions.length) return;

  const availableTickets = getAvailableTickets();
  if (availableTickets.length === 0) {
    alert("Não há mais rifas disponíveis!");
    return;
  }

  state.isAnimating = true;
  const button = document.getElementById("draw-button");
  button.disabled = true;
  button.textContent = "A sortear...";

  animateSelection((winningTicket) => {
    if (winningTicket === null) {
      state.isAnimating = false;
      button.disabled = false;
      button.textContent = "Sortear Próximo Prémio";
      alert("Não há mais rifas disponíveis!");
      return;
    }

    // Add winner to state
    const prize = state.prizeDescriptions[state.currentPrize];
    state.winners.push({
      ticketNumber: winningTicket,
      prize: prize,
      prizeIndex: state.currentPrize,
    });
    state.currentPrize++;

    // Update UI
    const ticketElement = document.querySelector(
      `[data-ticket="${winningTicket}"]`,
    );
    if (ticketElement) {
      ticketElement.classList.add("winner");
      ticketElement.classList.remove("highlight");
    }

    updateWinnersDisplay();
    updatePrizeStatus();
    showWinnerModal(winningTicket, prize);

    // Re-enable button if more prizes remain
    state.isAnimating = false;
    if (state.currentPrize < state.prizeDescriptions.length) {
      button.disabled = false;
      button.textContent = "Sortear próximo prémio";
    } else {
      button.textContent = "Todos os prémios foram sorteados";
    }
  });
}

// ==================== INITIALIZATION ====================
function init() {
  updateClock();
  setInterval(updateClock, 1000);

  createTicketGrid();
  updateWinnersDisplay();
  updatePrizeStatus();

  // Update tickets heading with count
  document.getElementById("tickets-heading").textContent =
    `🎫 Rifas Vendidas (${state.soldTickets.length})`;

  // Event listeners
  document
    .getElementById("draw-button")
    .addEventListener("click", handleDrawClick);
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("winner-modal").addEventListener("click", (e) => {
    if (e.target.id === "winner-modal") closeModal();
  });
}

// Start the app
init();
