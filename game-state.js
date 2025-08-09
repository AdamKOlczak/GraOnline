// game-state.js
import { ref, onValue, update, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

export function listenToGame(db, gameId, onUpdate) {
  const gameRef = ref(db, 'games/' + gameId);
  const unsubscribe = onValue(gameRef, snapshot => {
    const data = snapshot.val();
    onUpdate(data);
  });
  return unsubscribe;
}

  const gameRef = ref(db, 'games/' + gameId);
  unsubscribe = onValue(gameRef, snapshot => {
    const data = snapshot.val();
    onUpdate(data);
  });
}

export function makeMove(db, gameId, newState) {
  const gameRef = ref(db, 'games/' + gameId);
  return update(gameRef, newState);
}

export function createGame(db, gameId, initialState) {
  const gameRef = ref(db, 'games/' + gameId);
  return set(gameRef, initialState);
}

export function getGame(db, gameId) {
  const gameRef = ref(db, 'games/' + gameId);
  return get(gameRef);
}

export function stopListening() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
