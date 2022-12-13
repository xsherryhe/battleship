import startGameboardSetUp, {
  findGameboardSquare,
  gameboardSquares,
} from './dom-events-gameboard-setup';
import {
  gameAreaDivs,
  passDeviceContinueButton,
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
  turnOver,
} from './game';
import * as settings from './settings';
import {
  gameView,
  hideStartGameButton,
  highlightGameArea,
  modeSelectionView,
  passDeviceView,
  playerSetUpView,
  showMessage,
  showAttack,
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

passDeviceContinueButton.addEventListener('click', gameView);

function updateAutoAttacks(newIndex = 0) {
  setTimeout(() => {
    const autoAttacks = gameData.gameboards[gameData.currPlayerIndex].attacks;
    for (let i = newIndex; i < autoAttacks.length; i += 1) {
      const attack = autoAttacks[i];
      const square = findGameboardSquare(
        gameData.currPlayerIndex,
        attack.position
      );

      if (square.textContent === '') {
        showAttack(square, attack.hit);

        i += 1;
        if (i === autoAttacks.length) displayGame(false);
        else updateAutoAttacks(i);
        break;
      }
    }
  }, 1000);
}

function updateAttacks() {
  currGameboard().attacks.forEach((attack) => {
    showAttack(
      findGameboardSquare(1 - gameData.currPlayerIndex, attack.position),
      attack.hit
    );
  });
}

function displayGame(displayAutoTurn = true) {
  const player =
    (turnOver() && displayAutoTurn && gameData.players[computerIndex()]) ||
    currPlayer();
  const autoTurn = player.type === 'computerPlayer';

  showMessage(`${player.name}'s turn...`);
  highlightGameArea(1 - gameData.players.indexOf(player), autoTurn);
  updateAttacks();
  if (autoTurn) updateAutoAttacks();
}

function displayNotifications() {
  if (gameData.modes.playerMode === 1 && turnOver())
    setTimeout(() => {
      passDeviceView();
      displayGame();
    }, 1000);
}

function enableGameboardEvents() {
  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
    function takeTurn() {
      if (gameAreaDivs[gameAreaIndex].classList.contains('disabled')) return;
      if (gameAreaIndex !== 1 - gameData.currPlayerIndex) return;

      currPlayer().attack(currGameboard(), position);
      displayNotifications();
      displayGame();
      playGame(true);
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
