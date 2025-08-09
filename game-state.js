// game-state.js
import { db } from './firebase-config.js';
import { ref, onValue, runTransaction, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const SIZE = 8;
const gameRef = ref(db, 'boatGameWind8x8');

export function initializeGameIfNeeded() {
  get(gameRef).then(snap => {
    if (!snap.exists()) {
      set(gameRef, {
        p1: { row: SIZE - 1, col: 0 }, // SW
        p2: { row: 0, col: SIZE - 1 }, // NE
        currentTurn: "player1",
        wind: Math.random() < 0.5 ? "NW" : "SE"  // Only NW or SE
      });
    }
  });
}

export function listenToGame(onUpdate) {
  return onValue(gameRef, snapshot => {
    onUpdate(snapshot.val());
  });
}

function wrap(value) {
  return (value + SIZE) % SIZE;
}

export function makeMove(player, deltaRow, deltaCol) {
  return runTransaction(gameRef, game => {
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
}
