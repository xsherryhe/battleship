import * as settings from './settings';
import * as dom from './dom-elements';

function drawGameboards(squareLength, gameboardLength) {
  dom.gameboardDivs.forEach((gameboardDiv) => {
    gameboardDiv.style.display = 'grid';
    gameboardDiv.style.gridTemplate = `repeat(${gameboardLength}, ${squareLength}px) / repeat(${gameboardLength}, ${squareLength}px)`;

    for (let i = 0; i < gameboardLength ** 2; i += 1)
      gameboardDiv.insertAdjacentHTML(
        'beforeend',
        `<div class="square" data-index="${i}"></div>`
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
  template += `<button class="rotate">R</button></div>`;
  return template;
}

function drawShips(squareLength) {
  dom.shipsDivs.forEach((shipsDiv, gameAreaIndex) => {
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

export function drawGameAreas(nameLabels) {
  dom.gameboardLabelDivs.forEach((labelDiv, i) => {
    labelDiv.textContent = `${nameLabels[i]}'s Shipyard`;
  });

  const squareLength =
    Math.min(window.innerHeight, window.innerWidth) /
    (2.25 * settings.gameboardLength);
  drawGameboards(squareLength, settings.gameboardLength);
  drawShips(squareLength);
}

export function showGameboardSetUpMessage(name) {
  dom.gameMessage.textContent = `${name}, place your ships.`;
}

export function showGameboardSetUpChangePlayerButton() {
  console.log('show button');
}

export function showPlayGameButton() {}
