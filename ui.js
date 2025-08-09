// ui.js
import { makeMove, createNewGame, joinGame } from './game-state.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const btnNewGame = document.getElementById('btnNewGame');
const btnJoinGame = document.getElementById('btnJoinGame');
const gameIdInput = document.getElementById('gameIdInput');

let playerSymbol = null;
let myTurn = false;

function createBoard() {
  boardEl.innerHTML = '';
  for(let i=0; i<9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => {
      if (myTurn) makeMove(i);
    });
    boardEl.appendChild(cell);
  }
}

function updateBoard(boardState) {
  for(let i=0; i<9; i++) {
    const cell = boardEl.querySelector(`[data-index="${i}"]`);
    cell.textContent = boardState[i] || '';
    if (!myTurn || boardState[i]) {
      cell.classList.add('disabled');
      cell.style.pointerEvents = 'none';
    } else {
      cell.classList.remove('disabled');
      cell.style.pointerEvents = 'auto';
    }
  }
}

function onGameUpdate(boardState, statusText, isMyTurn, winner) {
  if (boardState) {
    updateBoard(boardState);
  }
  statusEl.textContent = statusText;
  myTurn = isMyTurn;
  if (winner) {
    // disable all cells if game ended
    Array.from(boardEl.children).forEach(c => {
      c.classList.add('disabled');
      c.style.pointerEvents = 'none';
    });
  }
}

btnNewGame.addEventListener('click', () => {
  const result = createNewGame(onGameUpdate);
  playerSymbol = result.playerSymbol;
  statusEl.textContent = `Nowa gra utworzona. Kod gry: ${result.gameId}. Czekaj na przeciwnika.`;
});

btnJoinGame.addEventListener('click', () => {
  const inputId = gameIdInput.value.trim().toUpperCase();
  if (!inputId) {
    alert('Podaj kod gry!');
    return;
  }
  joinGame(inputId, onGameUpdate)
    .then(result => {
      playerSymbol = result.playerSymbol;
      statusEl.textContent = `Dołączyłeś do gry ${result.gameId}. Tura gracza ${result.myTurn ? playerSymbol : (playerSymbol === 'X' ? 'O' : 'X')}.`;
    })
    .catch(err => alert(err.message));
});

createBoard();
