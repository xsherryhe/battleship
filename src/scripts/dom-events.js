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
  humanIndex,
  turnOver,
  validTurn,
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
  unhighlightGameAreas,
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
  const gameboardIndex = humanIndex();
  setTimeout(() => {
    const autoAttacks = gameData.gameboards[gameboardIndex].attacks;
    for (let i = newIndex; i < autoAttacks.length; i += 1) {
      const attack = autoAttacks[i];
      const square = findGameboardSquare(gameboardIndex, attack.position);

      if (!square.classList.contains('attacked')) {
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

function displayGameOver(displayAutoTurn = true) {
  const display =
    gameData.gameOver &&
    !(currPlayer().type === 'computerPlayer' && displayAutoTurn);
  if (display) {
    showMessage(`Game over! ${currPlayer().name} wins.`);
    unhighlightGameAreas();
  }
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
  displayGameOver(displayAutoTurn);
}

function displayTransition() {
  if (gameData.modes.playerMode === 1 && turnOver())
    setTimeout(() => {
      passDeviceView();
      displayGame();
    }, 1000);
}

function enableGameboardEvents() {
  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
    // TO DO: computer intelligence
    function takeTurn() {
      if (gameAreaDivs[gameAreaIndex].classList.contains('disabled')) return;
      if (!validTurn(gameAreaIndex)) return;

      try {
        currPlayer().attack(currGameboard(), position);
      } catch {
        return;
      }

      displayGame();
      displayTransition();
      playGame(true);
      displayGameOver();
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
