// ui.js
import { initializeGameIfNeeded, listenToGame, makeMove } from './game-state.js';

const SIZE = 8;
const directionsSymbols = { NW: "↖", SE: "↘" };

const gridEl = document.getElementById('grid');
const turnInfo = document.getElementById('turnInfo');
const windInfo = document.getElementById('windInfo');
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
      if (r === game.p1.row && c === game.p1.col) {
        td.textContent = '🚤1';
        td.className = 'p1';
      } else if (r === game.p2.row && c === game.p2.col) {
        td.textContent = '🚤2';
        td.className = 'p2';
      }
      tr.appendChild(td);
    }
    gridEl.appendChild(tr);
  }
}

listenToGame(game => {
  if (!game) return;
  drawGrid(game);
  windInfo.textContent = `Wind: ${game.wind} ${directionsSymbols[game.wind] || game.wind}`;
  turnInfo.textContent = `Current turn: ${game.currentTurn}`;

  const myTurn = (game.currentTurn === player);
  Object.values(btns).forEach(btn => {
    btn.classList.toggle('disabled', !myTurn);
  });
});

// Bind buttons
btns.up.onclick = () => makeMove(player, -1, 0);
btns.down.onclick = () => makeMove(player, 1, 0);
btns.left.onclick = () => makeMove(player, 0, -1);
btns.right.onclick = () => makeMove(player, 0, 1);
btns.upLeft.onclick = () => makeMove(player, -1, -1);
btns.upRight.onclick = () => makeMove(player, -1, 1);
btns.downLeft.onclick = () => makeMove(player, 1, -1);
btns.downRight.onclick = () => makeMove(player, 1, 1);
