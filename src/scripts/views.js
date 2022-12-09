import * as settings from './settings';
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

export function drawGameboards() {
  dom.gameboardDivs.forEach((gameboardDiv) => {
    const { gameboardLength } = settings;
    const squareSize =
      Math.min(window.innerHeight, window.innerWidth) /
      (2.25 * gameboardLength);

    gameboardDiv.style.display = 'grid';
    gameboardDiv.style.gridTemplate = `repeat(${gameboardLength}, ${squareSize}px) / repeat(${gameboardLength}, ${squareSize}px)`;

    for (let i = 0; i < gameboardLength ** 2; i += 1)
      gameboardDiv.insertAdjacentHTML(
        'beforeend',
        `<div class="square"></div>`
      );
  });
}

export function showGameboardSetUpMessage(name) {
  dom.gameMessage.textContent = `${name}, place your ships.`;
}

export function showGameArea(gameAreaIndex) {
  dom.gameAreaDivs.forEach((gameArea) => gameArea.classList.add('hidden'));
  dom.gameAreaDivs[gameAreaIndex].classList.remove('hidden');
}

export function showPlayGameButton() {}
