// game-state.js
import { db } from './firebase-config.js';
import { ref, onValue, runTransaction, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const SIZE = 8;
const gameRef = ref(db, 'boatGameWind8x8');

function wrap(value) {
  return (value + SIZE) % SIZE;
}

function generateDebris() {
  const debris = [];
  const forbidden = new Set();

  // forbid player starting points
  forbidden.add(`${SIZE - 1},0`); // P1
  forbidden.add(`0,${SIZE - 1}`); // P2

  // forbid center 4 squares
  const mid1 = SIZE / 2 - 1;
  const mid2 = SIZE / 2;
  for (let r = mid1; r <= mid2; r++) {
    for (let c = mid1; c <= mid2; c++) {
      forbidden.add(`${r},${c}`);
    }
  }

  while (debris.length < 8) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    const key = `${row},${col}`;
    if (!forbidden.has(key)) {
      forbidden.add(key);
      debris.push({ row, col });
    }
  }

  return debris;
}

function blowWind(game) {
  if (!game.debris) return game;

  let delta = { row: 0, col: 0 };
  switch (game.wind) {
    case "N": delta = { row: -1, col: 0 }; break;
    case "NE": delta = { row: -1, col: 1 }; break;
    case "E": delta = { row: 0, col: 1 }; break;
    case "SE": delta = { row: 1, col: 1 }; break;
    case "S": delta = { row: 1, col: 0 }; break;
    case "SW": delta = { row: 1, col: -1 }; break;
    case "W": delta = { row: 0, col: -1 }; break;
    case "NW": delta = { row: -1, col: -1 }; break;
  }

  game.debris = game.debris.map(d => ({
    row: wrap(d.row + delta.row),
    col: wrap(d.col + delta.col)
  }));

  return game;
}

export function initializeGameIfNeeded() {
  get(gameRef).then(snap => {
    if (!snap.exists()) {
      set(gameRef, {
        p1: { row: SIZE - 1, col: 0 },
        p2: { row: 0, col: SIZE - 1 },
        currentTurn: "player1",
        wind: Math.random() < 0.5 ? "NW" : "SE", // only NW or SE
        debris: generateDebris(),
        lastAction: null,
        moveCountSinceWind: 0
      });
    }
  });
}

export function listenToGame(onUpdate) {
  return onValue(gameRef, snapshot => {
    onUpdate(snapshot.val());
  });
}

export function makeMove(player, deltaRow, deltaCol) {
  return runTransaction(gameRef, game => {
    if (!game) return game;
    if (game.currentTurn !== player) return game;

    // Move player
    if (player === "player1") {
      game.p1.row = wrap(game.p1.row + deltaRow);
      game.p1.col = wrap(game.p1.col + deltaCol);
    } else {
      game.p2.row = wrap(game.p2.row + deltaRow);
      game.p2.col = wrap(game.p2.col + deltaCol);
    }

    // Count moves in a row
    game.moveCountSinceWind = (game.lastAction === "move")
      ? game.moveCountSinceWind + 1
      : 1;

    // If two moves in a row, wind blows & reset counter
    if (game.moveCountSinceWind >= 2) {
      game = blowWind(game);
      game.moveCountSinceWind = 0;
    }

    game.lastAction = "move";
    game.currentTurn = (game.currentTurn === "player1") ? "player2" : "player1";
    return game;
  });
}

export function changeWind(player, direction) {
  return runTransaction(gameRef, game => {
    if (!game) return game;
    if (game.currentTurn !== player) return game;
    if (direction === game.wind) return game; // can't set same wind

    // Blow wind BEFORE changing direction
    game = blowWind(game);
    game.moveCountSinceWind = 0; // reset counter after wind event

    // Change wind
    game.wind = direction;
    game.lastAction = "windChange";
    game.currentTurn = (game.currentTurn === "player1") ? "player2" : "player1";
    return game;
  });
}
