export const views = document.querySelectorAll('main > section');

export const modeSelectionView = document.querySelector(
  'section.mode-selection'
);
export const modeSelectionButtons = document.querySelectorAll(
  '.mode-selection button'
);

export const playerSetUpView = document.querySelector('section.player-set-up');
export const playerSetUpForm = document.querySelector(
  'section.player-set-up form'
);

export const gameView = document.querySelector('section.game');
export const gameMessage = document.querySelector('.game .message');
export const gameAreaDivs = document.querySelectorAll('.game .game-area');
export const gameboardLabelDivs = document.querySelectorAll(
  '.game .gameboard-label'
);
export const gameboardDivs = document.querySelectorAll('.game .gameboard');
export const gameboardSquareDivs = () =>
  document.querySelectorAll('.game .gameboard .square');
export const shipsDivs = document.querySelectorAll('.game .ships');
export const shipDivs = () => document.querySelectorAll('.game .ship');
export const shipDiv = (gameAreaIndex, shipIndex) =>
  document.querySelector(
    `.game .ship[data-game-area-index="${gameAreaIndex}"][data-index="${shipIndex}"]`
  );
export const rotateShipButtons = () =>
  document.querySelectorAll('.ship button.rotate');
export const updateGameboardSetUpButton = document.querySelector(
  'button.update-gameboard-set-up'
);
export const startGameButton = document.querySelector('button.start-game');
export const resetGameButton = document.querySelector('button.reset-game');

export const passDeviceView = document.querySelector('section.pass-device');
export const passDeviceContinueButton = document.querySelector(
  '.pass-device button.pass-device-continue'
);
