import Gameboard from './gameboard';
import { ComputerPlayer, HumanPlayer } from './player';

export const gameData = {
  gameboards: [],
  players: [],
  currPlayerIndex: 0,
  gameOver: false,
};

function initializeGameboards() {
  gameData.gameboards = [...new Array(2)].map(() => Gameboard());
}

function initializePlayers(mode) {
  if (mode) {
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

export function initializeGame({ playerMode = 0 } = {}) {
  initializeGameboards();
  initializePlayers(playerMode);
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
