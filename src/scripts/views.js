import * as dom from './dom-elements';

function hideAllViews() {
  dom.views.forEach((view) => view.classList.add('hidden'));
}

export function modeSelectionView() {
  hideAllViews();
  dom.modeSelectionView.classList.remove('hidden');
}

function playerNameFieldTemplate(i, playerMaxIndex) {
  return `<div class="field">
    <label for="player-${i}-name">Player${
    playerMaxIndex ? ` ${i + 1}` : ''
  } Name</label>
    <input type="text" name="player-${i}-name" id="player-${i}-name">
  </div>`;
}

export function playerSetUpView(playerMaxIndex) {
  hideAllViews();
  dom.playerSetUpView.classList.remove('hidden');

  for (let i = playerMaxIndex; i >= 0; i -= 1)
    dom.playerSetUpForm.insertAdjacentHTML(
      'afterBegin',
      playerNameFieldTemplate(i, playerMaxIndex)
    );
}

export function gameView() {
  hideAllViews();
  dom.gameView.classList.remove('hidden');
}

export function highlightGameArea(gameAreaIndex) {
  dom.gameAreaDivs.forEach((gameArea, i) => {
    const ships = gameArea.querySelectorAll('.ship');
    if (i !== gameAreaIndex) {
      gameArea.classList.add('disabled');
      ships.forEach((ship) => ship.classList.add('hidden'));
    } else {
      gameArea.classList.remove('disabled');
      ships.forEach((ship) => ship.classList.remove('hidden'));
    }
  });
}
