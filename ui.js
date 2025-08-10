export function showWindPopup(direction) {
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

  setTimeout(() => {
    popup.remove();
  }, 1500);
}
