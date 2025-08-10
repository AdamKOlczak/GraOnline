// --- Firebase initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyATOiD3Hp077WyGNi50KFTCxx_yrmuyxf0",
  authDomain: "gratest-cfc14.firebaseapp.com",
  databaseURL: "https://gratest-cfc14-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gratest-cfc14",
  storageBucket: "gratest-cfc14.firebasestorage.app",
  messagingSenderId: "26328738989",
  appId: "1:26328738989:web:18484211ec540a9cf66a24"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const SIZE = 8;
const initialWinds = ["NW", "SE"];
const allDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const directionSymbolsFull = {
  "N": "↑", "NE": "↗", "E": "→", "SE": "↘",
  "S": "↓", "SW": "↙", "W": "←", "NW": "↖"
};

const gridEl = document.getElementById('grid');
const turnInfo = document.getElementById('turnInfo');
const windInfo = document.getElementById('windInfo');
const modeInfo = document.getElementById('modeInfo');

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
const btnToggleMode = document.getElementById('btnToggleMode');
let player = null;
let mode = "move";
let currentGame = null;
let lastTurn = null;

// Disable movement buttons initially
Object.values(btns).forEach(btn => btn.disabled = true);
btnToggleMode.disabled = true;
const gameRef = db.ref('boatGameWind8x8');

// Init game if none
gameRef.once('value', snap => {
  if (!snap.exists()) {
    const initialWind = initialWinds[Math.floor(Math.random() * initialWinds.length)];
    gameRef.set({
      p1: { row: SIZE - 1, col: 0 },
      p2: { row: 0, col: SIZE - 1 },
      currentTurn: "player1",
      wind: initialWind
    });
  }
});

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
      } else if (game.debris && game.debris.some(d => d.row === r && d.col === c)) {
        td.textContent = '🪵';
      }
      tr.appendChild(td);
    }
    gridEl.appendChild(tr);
  }
}

document.getElementById('choosePlayer1').onclick = () => {
  player = 'player1';
  afterPlayerSelected();
};
document.getElementById('choosePlayer2').onclick = () => {
  player = 'player2';
  afterPlayerSelected();
};

function afterPlayerSelected() {
  document.getElementById('playerSelection').style.display = 'none';
  gameRef.once('value', snap => {
    const game = snap.val();
    if (!game) return;
    mode = "move";
    updateTurnButtonsCache(game);
  });
}

function updateModeUI() {
  modeInfo.textContent = `Mode: ${mode === "move" ? "Move" : "Change Wind"}`;
  btnToggleMode.style.backgroundColor = (mode === "wind") ? "#ccf" : "";
}

function updateTurnButtonsCache(game) {
  if (!game) return;
  currentGame = game;
  const myTurn = (game.currentTurn === player);
  Object.values(btns).forEach(btn => {
    btn.disabled = !myTurn;
  });
  btnToggleMode.disabled = !myTurn;
  updateModeUI();
  turnInfo.textContent = `Current turn: ${game.currentTurn} — You are ${player}`;
}

gameRef.on('value', snap => {
  const game = snap.val();
  if (!game) return;
  currentGame = game;
  drawGrid(game);
  windInfo.textContent = `Wind: ${game.wind} ${directionSymbolsFull[game.wind] || "?"}`;
  if (player) {
    if (game.currentTurn === player && lastTurn !== player) {
      mode = "move";
    }
    lastTurn = game.currentTurn;
    updateTurnButtonsCache(game);
  }
});

btnToggleMode.onclick = () => {
  if (!player || !currentGame) return;
  if (currentGame.currentTurn !== player) return;
  mode = (mode === "move") ? "wind" : "move";
  updateModeUI();
  updateTurnButtonsCache(currentGame);
};

function wrap(value) {
  return (value + SIZE) % SIZE;
}

function handleAction(deltaRow, deltaCol) {
  if (!player || !currentGame) return;
  if (currentGame.currentTurn !== player) return;
  if (mode === "move") {
    gameRef.transaction(game => {
      if (!game) return game;
      if (game.currentTurn !== player) return game;
      if (player === "player1") {
        game.p1.row = wrap(game.p1.row + deltaRow);
        game.p1.col = wrap(game.p1.col + deltaCol);
      } else {
        game.p2.row = wrap(game.p2.row + deltaRow);
        game.p2.col = wrap(game.p2.col + deltaCol);
      }
      game.currentTurn = (game.currentTurn === "player1") ? "player2" : "player1";
      return game;
    });
  } else {
    let vert = deltaRow === -1 ? "N" : deltaRow === 1 ? "S" : "";
    let horiz = deltaCol === -1 ? "W" : deltaCol === 1 ? "E" : "";
    const newWind = vert + horiz;
    if (!allDirections.includes(newWind)) {
      console.warn("Invalid wind direction selected:", newWind);
      return;
    }
    if (currentGame.wind === newWind) {
      console.log("Wind is already", newWind, "- no change");
      return;
    }
    gameRef.transaction(game => {
      if (!game) return game;
      if (game.currentTurn !== player) return game;
      game.wind = newWind;
      game.currentTurn = (game.currentTurn === "player1") ? "player2" : "player1";
      return game;
    });
  }
}

btns.up.onclick = () => handleAction(-1, 0);
btns.down.onclick = () => handleAction(1, 0);
btns.left.onclick = () => handleAction(0, -1);
btns.right.onclick = () => handleAction(0, 1);
btns.upLeft.onclick = () => handleAction(-1, -1);
btns.upRight.onclick = () => handleAction(-1, 1);
btns.downLeft.onclick = () => handleAction(1, -1);
btns.downRight.onclick = () => handleAction(1, 1);

function resetGame() {
  const p1start = { row: SIZE - 1, col: 0 };
  const p2start = { row: 0, col: SIZE - 1 };
  const forbidden = new Set();
  forbidden.add(`${p1start.row},${p1start.col}`);
  forbidden.add(`${p2start.row},${p2start.col}`);
  for (let r = 3; r <= 4; r++) {
    for (let c = 3; c <= 4; c++) {
      forbidden.add(`${r},${c}`);
    }
  }
  const debris = [];
  while (debris.length < 8) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    const key = `${r},${c}`;
    if (!forbidden.has(key) && !debris.some(d => d.row === r && d.col === c)) {
      debris.push({ row: r, col: c });
    }
  }
  const newWind = Math.random() < 0.5 ? "NW" : "SE";
  return gameRef.set({
    p1: p1start,
    p2: p2start,
    currentTurn: "player1",
    wind: newWind,
    debris: debris
  });
}

document.getElementById('btnResetGame').onclick = () => {
  resetGame()
    .then(() => console.log('Gra została zresetowana'))
    .catch(err => console.error('Błąd resetu gry:', err));
};
