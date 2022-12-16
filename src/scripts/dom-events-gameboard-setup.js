import {
  gameboardSquareDivs,
  shipDivs,
  rotateShipButtons,
  updateGameboardSetUpButton,
  shipsDivs,
} from './dom-elements';
import {
  gameView,
  highlightGameArea,
  showMessage,
  passDeviceView,
} from './views';
import {
  drawGameAreas,
  colorizeShipBorder,
  uncolorizeShipBorder,
  showChangedShipOrientation,
  showErrorShipOrientation,
  showUpdateGameboardSetUpButton,
  hideUpdateGameboardSetUpButton,
  showStartGame,
  showHoverRotateShipButton,
  showNormalRotateShipButton,
  colorizeDragContainer,
  uncolorizeDragContainer,
} from './views-gameboard-setup';
import { gameData } from './game';
import * as settings from './settings';
import { equalsArray } from './utilities';

export const gameboardSquares = [];
function populateGameboardSquares() {
  [...gameboardSquareDivs()].forEach((square, i) => {
    gameboardSquares[i] = {
      square,
      position: [
        Math.floor(square.dataset.index / 10),
        square.dataset.index % 10,
      ],
      gameAreaIndex: Number(square.closest('.game-area').dataset.index),
    };
  });
}

export function findGameboardSquare(gameAreaIndex, position) {
  return gameboardSquares.find(
    ({ position: targetPosition, gameAreaIndex: targetGameAreaIndex }) =>
      gameAreaIndex === targetGameAreaIndex &&
      equalsArray(position, targetPosition)
  ).square;
}

let currGameboardSetUpIndex = -1;
function enableGameboardSetUpEvents() {
  function updateShipPosition(
    ship,
    shipPosition = gameData.gameboards[currGameboardSetUpIndex].ships[
      Number(ship.dataset.index)
    ].position
  ) {
    ship.classList.add('on-gameboard');
    const targetSquare = findGameboardSquare(
      currGameboardSetUpIndex,
      shipPosition
    );
    targetSquare.appendChild(ship);
  }

  function enableGameboardDragAndDrop() {
    let draggedShip;
    shipsDivs.forEach((shipsDiv, gameAreaIndex) => {
      function dragOverShips(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        colorizeDragContainer(shipsDiv, true);
      }
      shipsDiv.addEventListener('dragover', dragOverShips);
      shipsDiv.addEventListener('dragleave', () =>
        uncolorizeDragContainer(shipsDiv)
      );

      function dropOnShips() {
        if (currGameboardSetUpIndex !== gameAreaIndex) return;

        gameData.gameboards[gameAreaIndex].unplaceShip(
          Number(draggedShip.dataset.index)
        );
        draggedShip.classList.remove('on-gameboard');
        shipsDiv.appendChild(draggedShip);
        hideUpdateGameboardSetUpButton();
      }
      shipsDiv.addEventListener('drop', dropOnShips);
    });

    gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
      function dragOverSquare(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (currGameboardSetUpIndex !== gameAreaIndex) return;

        const shipIndex = Number(draggedShip.dataset.index);
        const shipOrientation = Number(draggedShip.dataset.orientation);
        const legalShipPlacement = gameData.gameboards[
          gameAreaIndex
        ].legalShipPlacement(shipIndex, position);
        colorizeShipBorder(
          position,
          shipOrientation,
          settings.shipLengths[shipIndex],
          gameAreaIndex,
          legalShipPlacement
        );
      }
      square.addEventListener('dragover', dragOverSquare);
      square.addEventListener('dragleave', uncolorizeShipBorder);

      function dropOnSquare() {
        if (currGameboardSetUpIndex !== gameAreaIndex) return;

        const shipIndex = Number(draggedShip.dataset.index);
        try {
          gameData.gameboards[gameAreaIndex].placeShip(shipIndex, position);
        } catch {
          return;
        }

        updateShipPosition(draggedShip);
        if (gameData.gameboards[gameAreaIndex].allShipsPlaced())
          showUpdateGameboardSetUpButton();
      }
      square.addEventListener('drop', dropOnSquare);
    });

    const ships = shipDivs();
    ships.forEach((ship) => {
      function drag() {
        document.body.classList.add('dragging');
        ship.classList.add('invisible');
        ships.forEach((otherShip) => {
          otherShip.closest('.square')?.classList?.add('with-background-ship');
        });
      }
      ship.addEventListener('drag', drag);

      function dragStart(e) {
        document.body.classList.add('dragging'); // For cross-browser compatability
        draggedShip = ship;
        const squareCenter = Number(ship.dataset.squareLength) / 2;
        e.dataTransfer.setDragImage(ship, squareCenter, squareCenter);
      }
      ship.addEventListener('dragstart', dragStart);

      function dragEnd() {
        document.body.classList.remove('dragging');
        ship.classList.remove('invisible');
        shipsDivs.forEach((shipsDiv) => uncolorizeDragContainer(shipsDiv));
        uncolorizeShipBorder();
        ships.forEach((otherShip) => {
          otherShip
            .closest('.square')
            ?.classList?.remove('with-background-ship');
        });
      }
      ship.addEventListener('dragend', dragEnd);
    });
  }
  enableGameboardDragAndDrop();

  function rotateShip(e) {
    const ship = e.target.closest('.ship');
    const [gameAreaIndex, shipIndex] = ['gameAreaIndex', 'index'].map(
      (attribute) => Number(ship.dataset[attribute])
    );
    const shipPosition =
      gameData.gameboards[gameAreaIndex].ships[shipIndex].position;

    try {
      gameData.gameboards[gameAreaIndex].rotateShip(shipIndex);
    } catch {
      showErrorShipOrientation(ship, shipPosition);
      return;
    }

    if (shipPosition) updateShipPosition(ship);
    showChangedShipOrientation(ship);
  }
  rotateShipButtons().forEach((button) => {
    button.addEventListener('click', rotateShip);
    button.addEventListener('mouseover', () =>
      showHoverRotateShipButton(button)
    );
    button.addEventListener('mouseout', () =>
      showNormalRotateShipButton(button)
    );
  });
}

function updateGameboardSetUp() {
  hideUpdateGameboardSetUpButton();

  const index = gameData.gameboards.findIndex(
    (gameboard) => !gameboard.allShipsPlaced()
  );
  if (index < 0) {
    showStartGame();
    return;
  }

  const playerName = gameData.players[index].name;
  highlightGameArea(index, true);
  showMessage(
    `${playerName} (Player ${index + 1}), place your ships. Drag and drop them!`
  );
  if (currGameboardSetUpIndex >= 0 && index !== currGameboardSetUpIndex)
    passDeviceView(playerName, index);
  currGameboardSetUpIndex = index;
}
updateGameboardSetUpButton.addEventListener('click', updateGameboardSetUp);

export default function startGameboardSetUp() {
  gameView();
  drawGameAreas(gameData.players.map((player) => player.name));
  populateGameboardSquares();
  enableGameboardSetUpEvents();
  updateGameboardSetUp();
}
