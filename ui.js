// ui.js
import { listenToGame, makeMove, createGame, getGame, stopListening } from './game-state.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const btnNewGame = document.getElementById('btnNewGame');
const btnJoinGame = document.getElementById('btnJoinGame');
const gameIdInput = document.getElementById('gameIdInput');

let playerSymbol = null;
let myTurn = false;
let gameId = null;
let unsubscribe = null;

function createBoard() {
  boardEl.innerHTML = '';
  for(let i=0; i<9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => {
      if (myTurn) makeMoveHandler(i);
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

function onGameUpdate(data) {
  if (!data) {
    statusEl.textContent = 'Gra nie istnieje lub została zakończona.';
    return;
  }
  
  updateBoard(data.board);

  if (data.winner) {
    if (data.winner === 'draw') {
      statusEl.textContent = 'Remis! 🎉';
    } else {
      statusEl.textContent = data.winner === playerSymbol ? 'Wygrałeś! 🎉' : 'Przegrałeś :(';
    }
    myTurn = false;
    disableBoard();
  } else {
    myTurn = (data.turn === playerSymbol);
    statusEl.textContent = myTurn ? 'Twoja tura!' : 'Tura przeciwnika...';
  }
}

function disableBoard() {
  Array.from(boardEl.children).forEach(c => {
    c.classList.add('disabled');
    c.style.pointerEvents = 'none';
  });
}

async function makeMoveHandler(index) {
  if (!myTurn) return;

  try {
    // Pobierz aktualny stan gry (możesz też przechowywać lokalnie, jeśli chcesz)
    const snapshot = await getGame(gameId);
    const data = snapshot.val();
    if (!data) return;

    if (data.board[index]) return; // pole zajęte

    // Zaktualizuj planszę lokalnie i na serwerze
    const newBoard = [...data.board];
    newBoard[index] = playerSymbol;

    // Sprawdzenie zwycięzcy (możesz przenieść do game-state.js jeśli chcesz)
    const winner = checkWinner(newBoard);

    await makeMove(gameId, {
      board: newBoard,
      turn: playerSymbol === 'X' ? 'O' : 'X',
      winner: winner || null
    });
  } catch(err) {
    alert('Błąd ruchu: ' + err.message);
  }
}

// Prosta funkcja sprawdzająca zwycięzcę
function checkWinner(board) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell)) return 'draw';
  return null;
}

btnNewGame.addEventListener('click', async () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  gameId = generateGameId();
  playerSymbol = 'X';
  myTurn = true;

  const initialState = {
    board: Array(9).fill(null),
    turn: 'X',
    winner: null
  };

  await createGame(gameId, initialState);

  unsubscribe = listenToGame(gameId, onGameUpdate);

  statusEl.textContent = `Nowa gra utworzona. Kod gry: ${gameId}. Czekaj na przeciwnika.`;
});

btnJoinGame.addEventListener('click', async () => {
  const inputId = gameIdInput.value.trim().toUpperCase();
  if (!inputId) {
    alert('Podaj kod gry!');
    return;
  }

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  try {
    const snapshot = await getGame(inputId);
    const data = snapshot.val();

    if (!data) {
      alert('Nie ma takiej gry!');
      return;
    }
    if (data.winner) {
      alert('Gra już zakończona.');
      return;
    }

    gameId = inputId;
    playerSymbol = 'O';
    myTurn = (data.turn === playerSymbol);

    unsubscribe = listenToGame(gameId, onGameUpdate);

    statusEl.textContent = `Dołączyłeś do gry ${gameId}. Tura gracza ${data.turn}.`;
  } catch(err) {
    alert('Błąd dołączenia do gry: ' + err.message);
  }
});

function generateGameId() {
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

createBoard();
