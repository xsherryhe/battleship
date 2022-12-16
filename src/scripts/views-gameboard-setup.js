import * as settings from './settings';
import * as dom from './dom-elements';
import { showMessage } from './views';
import rotate from '../images/rotate.svg';
import rotateHover from '../images/rotate-hover.svg';

function drawGameboards(squareLength, gameboardLength) {
  dom.gameboardDivs.forEach((gameboardDiv) => {
    gameboardDiv.style.display = 'grid';
    gameboardDiv.style.gridTemplate = `repeat(${gameboardLength}, ${squareLength}px) / repeat(${gameboardLength}, ${squareLength}px)`;
    gameboardDiv.textContent = '';

    for (let i = 0; i < gameboardLength ** 2; i += 1)
      gameboardDiv.insertAdjacentHTML(
        'beforeend',
        `<button class="square" data-index="${i}"></button>`
      );
  });
}

function shipTemplate(squareLength, shipLength, shipIndex, gameAreaIndex) {
  let template = `<div style="display: grid; grid-template: repeat(${shipLength}, ${squareLength}px) / repeat(4, ${
    squareLength / 2
  }px);" class="ship" data-game-area-index="${gameAreaIndex}" data-index="${shipIndex}" data-square-length="${squareLength}" data-orientation="0" draggable="true">`;
  for (let i = 0; i < shipLength; i += 1) {
    if (i === 0) {
      template += `<div class="ship-square top-left"></div>`;
      template += `<div class="ship-square top-right"></div>`;
    } else if (i === shipLength - 1) {
      template += `<div class="ship-square bottom-left"></div>`;
      template += `<div class="ship-square bottom-right"></div>`;
    } else {
      template += `<div class="ship-square full"></div>`;
    }
  }
  template += `<button class="rotate"><img src=${rotate} alt="rotate"></button></div>`;
  return template;
}

function drawShips(squareLength) {
  dom.shipsDivs.forEach((shipsDiv, gameAreaIndex) => {
    shipsDiv.textContent = '';
    settings.shipLengths.forEach((shipLength, shipIndex) => {
      shipsDiv.insertAdjacentHTML(
        'beforeend',
        shipTemplate(squareLength, shipLength, shipIndex, gameAreaIndex)
      );
    });
  });
}

export function showChangedShipOrientation(ship) {
  ship.dataset.orientation = 1 - Number(ship.dataset.orientation);
  ship.style.gridTemplate = ship.style.gridTemplate
    .split(' / ')
    .reverse()
    .join(' / ');
}

export function colorizeShipBorder(
  [row, col],
  orientation,
  shipLength,
  gameboardIndex,
  legal
) {
  const borderOffsets = [
    [-1, 0],
    [shipLength, 0],
  ];
  for (let i = -1; i <= shipLength; i += 1) borderOffsets.push([i, -1], [i, 1]);

  borderOffsets
    .map((offsets) => {
      const [rowOffset, colOffset] = orientation ? offsets.reverse() : offsets;
      return [row + rowOffset, col + colOffset];
    })
    .filter((position) =>
      position.every((coord) => coord >= 0 && coord < settings.gameboardLength)
    )
    .forEach(([borderRow, borderCol]) => {
      const squareIndex = settings.gameboardLength * borderRow + borderCol;
      dom.gameboardDivs[gameboardIndex]
        .querySelector(`.square[data-index="${squareIndex}"]`)
        .classList.add(`${legal ? 'legal' : 'error'}-border`);
    });
}

export function uncolorizeShipBorder() {
  dom.gameboardSquareDivs().forEach((square) => {
    square.classList.remove('legal-border', 'error-border');
  });
}

export function showErrorShipOrientation(ship, position) {
  showChangedShipOrientation(ship);
  colorizeShipBorder(
    position,
    Number(ship.dataset.orientation),
    settings.shipLengths[Number(ship.dataset.index)],
    Number(ship.dataset.gameAreaIndex),
    false
  );

  setTimeout(() => {
    showChangedShipOrientation(ship);
    uncolorizeShipBorder();
  }, 500);
}

export function colorizeDragContainer(element, legal) {
  element.classList.add(`${legal ? 'legal' : 'error'}-drag`);
}

export function uncolorizeDragContainer(element) {
  element.classList.remove('legal-drag', 'error-drag');
}

export function drawGameAreas(nameLabels) {
  dom.gameboardLabelDivs.forEach((labelDiv, i) => {
    labelDiv.textContent = `${nameLabels[i]}’s Shipyard`;
  });
  dom.remainingShipsDivs.forEach((div) => div.classList.add('hidden'));

  const squareLength =
    Math.min(window.innerHeight, window.innerWidth) /
    (1.8 * settings.gameboardLength);
  drawGameboards(squareLength, settings.gameboardLength);
  drawShips(squareLength);
}

export function showHoverRotateShipButton(button) {
  button.querySelector('img').src = rotateHover;
}

export function showNormalRotateShipButton(button) {
  button.querySelector('img').src = rotate;
}

export function showUpdateGameboardSetUpButton() {
  dom.updateGameboardSetUpButton.classList.remove('hidden');
}

export function hideUpdateGameboardSetUpButton() {
  dom.updateGameboardSetUpButton.classList.add('hidden');
}

export function showStartGame() {
  dom.gameAreaDivs.forEach((gameArea) => gameArea.classList.add('disabled'));
  dom.shipDivs().forEach((ship) => {
    ship.classList.add('hidden');
    const square = ship.closest('.square');
    if (square) square.classList.add('with-background-ship');
    ship.draggable = false;
  });
  dom.rotateShipButtons().forEach((button) => button.classList.add('hidden'));

  showMessage('Click the Start Game button to begin the game!');
  dom.startGameButton.classList.remove('hidden');
}
