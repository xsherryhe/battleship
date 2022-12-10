import {
  modeSelectionButtons,
  playerSetUpForm,
} from './dom-elements';
import enableGameboardDragAndDrop from './dom-events-drag-and-drop';
import { gameData, initializeGame } from './game';
import * as settings from './settings';
import {
  modeSelectionView,
  playerSetUpView,
  gameView,
  drawGameAreas,
  highlightGameArea,
  showGameboardSetUpMessage,
  showPlayGameButton,
} from './views';

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

function updateGameboardSetUp() {
  const index = gameData.gameboards.findIndex(
    (gameboard) => !gameboard.allShipsPlaced()
  );
  if (index < 0) showPlayGameButton();
  highlightGameArea(index);
  showGameboardSetUpMessage(gameData.players[index].name);
}

function startGameboardSetUp() {
  gameView();
  drawGameAreas(gameData.players.map((player) => player.name));
  enableGameboardDragAndDrop();
  updateGameboardSetUp();
}
/*
function placeShip() {
  call gameboard.placeShip
  updateGameboardSetUp();
}
*/
