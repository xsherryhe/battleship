import Gameboard from './gameboard';
import { ComputerPlayer, HumanPlayer } from './player';

export const gameData = {
  modes: { playerMode: 0 },
  players: [],
  gameboards: [],
  currPlayerIndex: 0,
  gameOver: false,
};

function initializeModes(modes) {
  const gameModes = { ...modes };
  Object.keys(gameModes).forEach((mode) => {
    gameModes[mode] = Number(gameModes[mode]);
  });
  gameData.modes = gameModes;
}

function initializeGameboards(length) {
  gameData.gameboards = [...new Array(2)].map(() => Gameboard({ length }));
  if (gameData.modes.playerMode) return;

  const computerPlayerIndex = gameData.players.findIndex(
    (player) => player.type === 'computerPlayer'
  );
  gameData.gameboards[computerPlayerIndex].autoPlaceShips();
}

function initializePlayers() {
  if (gameData.modes.playerMode) {
    gameData.players = [...new Array(2)].map(() => HumanPlayer());
  } else {
    gameData.players = [];
    const humanPlayerIndex = Math.floor(Math.random() * 2);
    gameData.players[humanPlayerIndex] = HumanPlayer();
    gameData.players[1 - humanPlayerIndex] = ComputerPlayer();
  }
}

function initializePlayerIndex() {
  gameData.currPlayerIndex = 0;
}

function initializeGameOver() {
  gameData.gameOver = false;
}

function getGameOver() {
  return gameData.gameboards.some((gameboard) => gameboard.allSunk());
}

export function initializeGame({ playerMode = 0, gameboardLength = 10 } = {}) {
  initializeModes({ playerMode });
  initializePlayers();
  initializeGameboards(gameboardLength);
  initializePlayerIndex();
  initializeGameOver();
}

export function currGameboard() {
  return gameData.gameboards[1 - gameData.currPlayerIndex];
}

export function currPlayer() {
  return gameData.players[gameData.currPlayerIndex];
}

export function playGame(tookTurn = false) {
  let turnTaken = tookTurn;
  while (!gameData.gameOver) {
    turnTaken ||= currPlayer().takeTurn(currGameboard());
    if (!turnTaken) break;

    gameData.gameOver = getGameOver();
    gameData.currPlayerIndex = 1 - gameData.currPlayerIndex;
    turnTaken = false;
  }
}
