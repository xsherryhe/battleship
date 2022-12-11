import { modeSelectionButtons, playerSetUpForm } from './dom-elements';
import startGameboardSetUp from './dom-events-gameboard-setup';
import { gameData, initializeGame } from './game';
import * as settings from './settings';
import { modeSelectionView, playerSetUpView } from './views';

window.addEventListener('load', modeSelectionView);

function submitMode(e) {
  initializeGame({
    playerMode: Number(e.target.closest('button').dataset.mode),
    gameboardLength: settings.gameboardLength,
    shipLengths: settings.shipLengths,
  });
  playerSetUpView(gameData.modes.playerMode);
}
modeSelectionButtons.forEach((button) =>
  button.addEventListener('click', submitMode)
);

function submitPlayerSetUp(e) {
  e.preventDefault();
  const names = [...e.target.querySelectorAll('input')].map(
    (input) => input.value
  );
  let nameIndex = 0;
  gameData.players.forEach((player) => {
    if (player.type === 'humanPlayer') {
      player.setName(names[nameIndex]);
      nameIndex += 1;
    }
  });
  startGameboardSetUp();
}
playerSetUpForm.addEventListener('submit', submitPlayerSetUp);
