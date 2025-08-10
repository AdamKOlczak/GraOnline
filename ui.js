// ui.js
import { initializeGameIfNeeded, listenToGame, makeMove, toggleMode } from './game-state.js';

const SIZE = 8;
const directionsSymbols = {
  N: "↑", NE: "↗", E: "→", SE: "↘",
  S: "↓", SW: "↙", W: "←", NW: "↖"
};

const gridEl = document.getElementById('grid');
const turnInfo = document.getElementById('turnInfo');
const windInfo = document.getElementById('windInfo');
const toggleBtn = document.getElementById('toggleMode');

const btns = {
  up: document.getElementById('btnUp'),
  down: document.getElementById('btnDown'),
  left: document.getElementById('btnLeft'),
  right: document.getElementById('btnRight'),
  upLeft: document.getElementById('btnUpLeft'),
  upRight: document.getElementById('btnUpRight'),
  downLeft: document.getElementById('btnDownLeft'),
  downRight: document.getElementById('btnDownRight')
};

let player = null;
while (player !== 'player1' && player !== 'player2') {
  player = prompt("Enter your player name (player1 or player2):").trim().toLowerCase();
}

initializeGameIfNeeded();

function drawGrid(game) {
  gridEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < SIZE; c++) {
      const td = document.createElement('td');

      // Player boats
      if (r === game.p1.row && c === game.p1.col) {
        td.textContent = '🚤1';
        td.className = 'p1';
      } else if (r === game.p2.row && c === game.p2.col) {
        td.textContent = '🚤2';
        td.className = 'p2';
      }
      // Debris
      else if (game.debris && game.debris.some(d => d.row === r && d.col === c)) {
        td.textContent = '🪵';
      }

      tr.appendChild(td);
    }
    gridEl.appendChild(tr);
  }
}
const windBlowInfo = document.getElementById('windBlowInfo');

export function showWindPopup(direction) {
  // Remove existing popup if present
  let existing = document.getElementById('wind-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'wind-popup';
  popup.style.position = 'fixed';
  popup.style.top = '40%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = 'rgba(0,0,0,0.8)';
  popup.style.color = 'white';
  popup.style.padding = '2em 3em';
  popup.style.borderRadius = '20px';
  popup.style.fontSize = '2em';
  popup.style.zIndex = 10000;
  popup.innerText = `💨 Wind blows ${direction}!`;

  document.body.appendChild(popup);

  // Remove the popup after 1.5 seconds
  setTimeout(() => {
    popup.remove();
  }, 1500);
}

listenToGame(game => {
  if (!game) return;
  drawGrid(game);
  windInfo.textContent = `Wind: ${game.wind} ${directionsSymbols[game.wind] || game.wind}`;
  turnInfo.textContent = `Current turn: ${game.currentTurn}`;

  if (game.windJustBlew) {
    windBlowInfo.textContent = "🌬️ Wind blew! Debris moved.";
  } else {
    windBlowInfo.textContent = "";
  }

  const myTurn = (game.currentTurn === player);
  Object.values(btns).forEach(btn => {
    btn.classList.toggle('disabled', !myTurn);
  });
});

// Bind movement/wind change buttons
btns.up.onclick = () => makeMove(player, -1, 0);
btns.down.onclick = () => makeMove(player, 1, 0);
btns.left.onclick = () => makeMove(player, 0, -1);
btns.right.onclick = () => makeMove(player, 0, 1);
btns.upLeft.onclick = () => makeMove(player, -1, -1);
btns.upRight.onclick = () => makeMove(player, -1, 1);
btns.downLeft.onclick = () => makeMove(player, 1, -1);
btns.downRight.onclick = () => makeMove(player, 1, 1);

// Toggle move/wind mode
toggleBtn.onclick = () => toggleMode(player);
