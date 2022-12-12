import {
  gameboardSquareDivs,
  shipDivs,
  rotateShipButtons,
} from './dom-elements';
import { gameView, highlightGameArea } from './views';
import {
  drawGameAreas,
  colorizeShipBorder,
  uncolorizeShipBorder,
  showChangedShipOrientation,
  showErrorShipOrientation,
  showGameboardSetUpMessage,
  showGameboardSetUpChangePlayerButton,
  showPlayGameButton,
} from './views-gameboard-setup';
import { gameData } from './game';
import * as settings from './settings';
import { equalsArray } from './utilities';

function enableGameboardSetUpEvents() {
  const gameboardSquares = [...gameboardSquareDivs()].map((square) => ({
    square,
    position: [
      Math.floor(square.dataset.index / 10),
      square.dataset.index % 10,
    ],
    gameAreaIndex: Number(square.closest('.game-area').dataset.index),
  }));

  function updateShipPosition(
    ship,
    gameboardIndex = Number(ship.dataset.gameAreaIndex),
    shipPosition = gameData.gameboards[gameboardIndex].ships[
      Number(ship.dataset.index)
    ].position
  ) {
    ship.classList.add('on-gameboard');
    const targetSquare = gameboardSquares.find(
      ({ position: targetPosition, gameAreaIndex: targetGameAreaIndex }) =>
        gameboardIndex === targetGameAreaIndex &&
        equalsArray(shipPosition, targetPosition)
    ).square;
    targetSquare.appendChild(ship);
  }

  function enableGameboardDragAndDrop() {
    let draggedShip;
    gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
      function dragOverSquare(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (Number(draggedShip.dataset.gameAreaIndex) !== gameAreaIndex) return;

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
        if (Number(draggedShip.dataset.gameAreaIndex) !== gameAreaIndex) return;

        const shipIndex = Number(draggedShip.dataset.index);
        try {
          gameData.gameboards[gameAreaIndex].placeShip(shipIndex, position);
        } catch {
          return;
        }

        updateShipPosition(draggedShip);
        if (gameData.gameboards[gameAreaIndex].allShipsPlaced())
          showGameboardSetUpChangePlayerButton();
      }
      square.addEventListener('drop', dropOnSquare);
    });

    const ships = shipDivs();
    ships.forEach((ship) => {
      function drag() {
        ship.classList.add('hidden');
      }
      ship.addEventListener('drag', drag);

      function dragStart(e) {
        draggedShip = ship;
        const squareCenter = Number(ship.dataset.squareLength) / 2;
        e.dataTransfer.setDragImage(ship, squareCenter, squareCenter);
        ships.forEach((otherShip) => {
          if (
            otherShip !== ship &&
            otherShip.classList.contains('on-gameboard')
          )
            otherShip.closest('.square').classList.add('with-background-ship');
        });
      }
      ship.addEventListener('dragstart', dragStart);

      function dragEnd() {
        ship.classList.remove('hidden');
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
  rotateShipButtons().forEach((button) =>
    button.addEventListener('click', rotateShip)
  );
}

function updateGameboardSetUp() {
  const index = gameData.gameboards.findIndex(
    (gameboard) => !gameboard.allShipsPlaced()
  );
  if (index < 0) showPlayGameButton();
  highlightGameArea(index);
  showGameboardSetUpMessage(gameData.players[index].name);
}

export default function startGameboardSetUp() {
  gameView();
  drawGameAreas(gameData.players.map((player) => player.name));
  enableGameboardSetUpEvents();
  updateGameboardSetUp();
}
