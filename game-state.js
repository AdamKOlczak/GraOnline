// game-state.js
import { db } from './firebase-config.js';
import { ref, set, update, onValue, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

let gameId = null;
let playerSymbol = null;  // "X" lub "O"
let myTurn = false;
let boardState = Array(9).fill(null);
let unsubscribe = null;

function generateGameId() {
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

function createNewGame(onUpdate) {
  gameId = generateGameId();
  playerSymbol = 'X';
  myTurn = true;
  boardState = Array(9).fill(null);

  set(ref(db, 'games/' + gameId), {
    board: boardState,
    turn: 'X',
    winner: null
  });

  listenToGame(onUpdate);

  return { gameId, playerSymbol, myTurn };
}

function joinGame(inputId, onUpdate) {
  gameId = inputId.toUpperCase();
  return get(ref(db, 'games/' + gameId)).then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      throw new Error('Nie ma takiej gry!');
    }
    if (data.winner) {
      throw new Error('Gra już zakończona.');
    }
    playerSymbol = 'O';
    listenToGame(onUpdate);
    myTurn = (data.turn === playerSymbol);
    return { gameId, playerSymbol, myTurn };
  });
}

function listenToGame(onUpdate) {
  if (unsubscribe) unsubscribe(); // if previously subscribed, unsubscribe first

  const gameRef = ref(db, 'games/' + gameId);
  const listener = onValue(gameRef, snapshot => {
    const data = snapshot.val();
    if (!data) {
      onUpdate(null, 'Gra nie istnieje lub została zakończona.');
      return;
    }
    boardState = data.board || Array(9).fill(null);

    let statusMessage = '';
    if (data.winner) {
      if (data.winner === 'draw') {
        statusMessage = 'Remis! 🎉';
      } else {
        statusMessage = data.winner === playerSymbol ? 'Wygrałeś! 🎉' : 'Przegrałeś :(';
      }
      myTurn = false;
    } else {
      myTurn = (data.turn === playerSymbol);
      statusMessage = myTurn ? 'Twoja tura!' : 'Tura przeciwnika...';
    }
    onUpdate(boardState, statusMessage, myTurn, data.winner);
  });

  unsubscribe = () => gameRef.off('value', listener);
}

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

function makeMove(i) {
  if (!myTurn || boardState[i]) return;
  if (checkWinner(boardState)) return;

  const newBoard = [...boardState];
  newBoard[i] = playerSymbol;
  const winner = checkWinner(newBoard);

  update(ref(db, 'games/' + gameId), {
    board: newBoard,
    turn: playerSymbol === 'X' ? 'O' : 'X',
    winner: winner || null
  });
}

export {
  createNewGame,
  joinGame,
  makeMove
};
