import startGameboardSetUp, {
  disableGameboardSetUpEvents,
  findGameboardSquare,
  gameboardSquares,
} from './dom-events-gameboard-setup';
import {
  gameAreaDivs,
  passDeviceContinueButton,
  modeSelectionButtons,
  playerSetUpForm,
  startGameButton,
  infoContinueButton,
  resetGameButtons,
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
  showResetGameButton,
  hideResetGameButton,
  showRemainingShipsCount,
  infoView,
  showGameAreas,
  showGameAreaPlay,
} from './views';
import validate from './dom-form-validation';

function resetGame() {
  hideResetGameButton();
  modeSelectionView();
}
window.addEventListener('load', resetGame);
resetGameButtons.forEach((button) =>
  button.addEventListener('click', resetGame)
);

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
  if (!validate(playerSetUpForm)) return;

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
  infoView(gameData.players.map((player) => player.name));
}
playerSetUpForm.addEventListener('submit', submitPlayerSetUp);

infoContinueButton.addEventListener('click', startGameboardSetUp);
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

function updateRemainingShips() {
  gameData.gameboards.forEach((gameboard, i) =>
    showRemainingShipsCount(i, gameboard.notSunkShips())
  );
}

function displayGameOver(displayAutoTurn = true) {
  const display =
    gameData.gameOver &&
    !(currPlayer().type === 'computerPlayer' && displayAutoTurn);
  if (display) {
    showMessage(
      `Game over! ${currPlayer().name} (Player ${
        gameData.currPlayerIndex + 1
      }) wins.`
    );
    unhighlightGameAreas();
    showResetGameButton();
  }
}

function displayGame(displayAutoTurn = true) {
  const player =
    (turnOver() && displayAutoTurn && gameData.players[computerIndex()]) ||
    currPlayer();
  const playerIndex = gameData.players.indexOf(player);
  const autoTurn = player.type === 'computerPlayer';

  const message = `${player.name} (Player ${playerIndex + 1})’s turn.${
    autoTurn ? '..' : " Click the enemy's shipyard to attack!"
  }`;
  showMessage(message);
  highlightGameArea(1 - playerIndex, autoTurn);

  updateAttacks();
  if (autoTurn) updateAutoAttacks();
  updateRemainingShips();

  displayGameOver(displayAutoTurn);
}

function displayTransition() {
  if (gameData.modes.playerMode === 1 && turnOver())
    setTimeout(() => {
      passDeviceView(currPlayer().name, gameData.currPlayerIndex);
      displayGame();
    }, 1000);
}

function enableGameboardEvents() {
  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
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
  disableGameboardSetUpEvents();
  hideStartGameButton();
  showGameAreas();
  showGameAreaPlay();
  enableGameboardEvents();

  if (gameData.modes.playerMode === 1)
    passDeviceView(gameData.players[0].name, 0);
  displayGame();
  playGame();
}
startGameButton.addEventListener('click', startGame);
