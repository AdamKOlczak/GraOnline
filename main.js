import { showWindPopup } from './ui.js';
import { blowWind } from './game-state.js';

// Example: simulate wind blowing on a button click
document.body.innerHTML += '<button id="test-wind">Blow Wind</button>';
document.getElementById('test-wind').onclick = function() {
  // You'd use your actual game object here
  showWindPopup('NE');
  // blowWind(game);
};
