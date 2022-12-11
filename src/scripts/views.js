import * as settings from './settings';
import * as dom from './dom-elements';

function hideAllViews() {
  dom.views.forEach((view) => view.classList.add('hidden'));
}

export function modeSelectionView() {
  hideAllViews();
  dom.modeSelectionView.classList.remove('hidden');
}

function playerNameFieldTemplate(i, playerMaxIndex) {
  return `<div class="field">
    <label for="player-${i}-name">Player${
    playerMaxIndex ? ` ${i + 1}` : ''
  } Name</label>
    <input type="text" name="player-${i}-name" id="player-${i}-name">
  </div>`;
}

export function playerSetUpView(playerMaxIndex) {
  hideAllViews();
  dom.playerSetUpView.classList.remove('hidden');

  for (let i = playerMaxIndex; i >= 0; i -= 1)
    dom.playerSetUpForm.insertAdjacentHTML(
      'afterBegin',
      playerNameFieldTemplate(i, playerMaxIndex)
    );
}

export function gameView() {
  hideAllViews();
  dom.gameView.classList.remove('hidden');
}

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
  let template = `<div style="display: grid; grid-template: repeat(${shipLength}, ${squareLength}px) / repeat(2, ${
    squareLength / 2
  }px);" class="ship" data-game-area-index="${gameAreaIndex}" data-index="${shipIndex}" data-square-center="${
    squareLength / 2
  }" draggable="true">`;
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
  template += '</div>';
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

export function colorizeShipBorder(
  [row, col],
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
    .map(([rowOffset, colOffset]) => [row + rowOffset, col + colOffset])
    .filter((position) =>
      position.every((coord) => coord >= 0 && coord < settings.gameboardLength)
    )
    .forEach(([borderRow, borderCol]) => {
      const squareIndex = settings.gameboardLength * borderRow + borderCol;
      dom.gameboardDivs[gameboardIndex].querySelector(
        `.square[data-index="${squareIndex}"]`
      ).style.backgroundColor = legal ? 'green' : 'red';
    });
}

export function uncolorizeShipBorder() {
  dom.gameboardSquareDivs().forEach((square) => {
    square.style.backgroundColor = 'transparent';
  });
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

export function highlightGameArea(gameAreaIndex) {
  dom.gameAreaDivs.forEach((gameArea, i) => {
    const ships = gameArea.querySelectorAll('.ship');
    if (i !== gameAreaIndex) {
      gameArea.classList.add('disabled');
      ships.forEach((ship) => ship.classList.add('hidden'));
    } else {
      gameArea.classList.remove('disabled');
      ships.forEach((ship) => ship.classList.remove('hidden'));
    }
  });
}

export function showPlayGameButton() {}
