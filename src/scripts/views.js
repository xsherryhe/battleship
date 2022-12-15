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
    <input type="text" name="player-${i}-name" id="player-${i}-name" required>
    <div class="error hidden"></div>
  </div>`;
}

export function playerSetUpView(playerMaxIndex) {
  hideAllViews();
  dom.playerSetUpView.classList.remove('hidden');

  dom.playerSetUpForm
    .querySelectorAll('.field')
    .forEach((field) => field.remove());
  for (let i = playerMaxIndex; i >= 0; i -= 1)
    dom.playerSetUpForm.insertAdjacentHTML(
      'afterBegin',
      playerNameFieldTemplate(i, playerMaxIndex)
    );
}

export function infoView(playerNames) {
  hideAllViews();
  dom.infoView.classList.remove('hidden');

  dom.playerNameSpans.forEach((playerNameSpan, i) => {
    playerNameSpan.textContent = playerNames[i];
  });
}

export function gameView() {
  hideAllViews();
  dom.gameView.classList.remove('hidden');
}

export function showMessage(message) {
  dom.gameMessage.textContent = message;
}

export function highlightGameArea(gameAreaIndex, ownGameArea = false) {
  dom.gameAreaDivs.forEach((gameArea, i) => {
    const ships = gameArea.querySelectorAll('.ship');
    if (i !== gameAreaIndex) {
      gameArea.classList.add('disabled');
      ships.forEach((ship) => {
        if (ownGameArea) ship.classList.add('hidden');
        else ship.classList.remove('hidden');
      });
    } else {
      gameArea.classList.remove('disabled');
      ships.forEach((ship) => {
        if (ownGameArea) ship.classList.remove('hidden');
        else ship.classList.add('hidden');
      });
    }
  });
}

export function unhighlightGameAreas() {
  dom.gameAreaDivs.forEach((gameArea) => gameArea.classList.add('disabled'));
}

export function showAttack(square, success) {
  if (square.classList.contains('attacked')) return;
  square.classList.add(success ? 'hit' : 'miss', 'attacked');
  square.insertAdjacentHTML(
    'beforeend',
    `<p class="marker">${success ? '╳' : '⬤'}</p>`
  );
}

export function showRemainingShips(ships) {
  dom.remainingShipsDivs.forEach((div) => div.classList.remove('hidden'));
  dom.remainingShipsSpans.forEach((span) => {
    span.textContent = ships;
  });
}

export function showRemainingShipsCount(gameAreaIndex, ships) {
  dom.remainingShipsSpans[gameAreaIndex].textContent = ships;
}

export function hideStartGameButton() {
  dom.startGameButton.classList.add('hidden');
}

export function showResetGameButton() {
  dom.resetGameButton.classList.remove('hidden');
}

export function hideResetGameButton() {
  dom.resetGameButton.classList.add('hidden');
}

export function passDeviceView(playerName, playerIndex) {
  hideAllViews();
  dom.passDeviceView.classList.remove('hidden');
  dom.passDevicePlayerSpan.textContent = `${playerName || 'the next player'}${
    playerIndex !== undefined ? ` (Player ${playerIndex + 1})` : ''
  }`;
}
