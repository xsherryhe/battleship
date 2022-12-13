import startGameboardSetUp, {
  gameboardSquares,
} from './dom-events-gameboard-setup';
import {
  gameAreaDivs,
  modeSelectionButtons,
  playerSetUpForm,
  startGameButton,
} from './dom-elements';
import {
  currPlayer,
  currGameboard,
  gameData,
  initializeGame,
  playGame,
  computerIndex,
} from './game';
import * as settings from './settings';
import {
  hideStartGameButton,
  highlightGameArea,
  modeSelectionView,
  playerSetUpView,
  showMessage,
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

// TO DO: update attacks on given player input's gameboard
function displayGame(player = currPlayer()) {
  const computerTurn = player.type === 'computerPlayer';
  showMessage(`${player.name}'s turn...`);
  highlightGameArea(1 - gameData.players.indexOf(player), computerTurn);
  if (computerTurn) setTimeout(displayGame, 1000);
}

function enableGameboardEvents() {
  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
    function takeTurn() {
      if (gameAreaDivs[gameAreaIndex].classList.contains('disabled')) return;
      if (gameAreaIndex !== 1 - gameData.currPlayerIndex) return;

      currPlayer().attack(currGameboard(), position);
      playGame(true);
      // TO DO: Implement pass screen view for 2-player mode
      displayGame(gameData.players[computerIndex()]);
    }
    square.addEventListener('click', takeTurn);
  });
}

function startGame() {
  hideStartGameButton();
  enableGameboardEvents();
  displayGame();
  playGame();
}
startGameButton.addEventListener('click', startGame);
