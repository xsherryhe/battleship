import { gameboardSquareDivs, shipDivs } from './dom-elements';
import {
  gameView,
  drawGameAreas,
  colorizeShipBorder,
  uncolorizeShipBorder,
  showPlayGameButton,
  highlightGameArea,
  showGameboardSetUpMessage,
} from './views';
import { gameData } from './game';
import * as settings from './settings';
import { equalsArray } from './utilities';

let draggedShip;

function updateGameboardSetUp() {
  const index = gameData.gameboards.findIndex(
    (gameboard) => !gameboard.allShipsPlaced()
  );
  if (index < 0) showPlayGameButton();
  highlightGameArea(index);
  showGameboardSetUpMessage(gameData.players[index].name);
}

function enableGameboardDragAndDrop() {
  const gameboardSquares = [...gameboardSquareDivs()].map((square) => ({
    square,
    position: [
      Math.floor(square.dataset.index / 10),
      square.dataset.index % 10,
    ],
    gameAreaIndex: Number(square.closest('.game-area').dataset.index),
  }));
  const ships = shipDivs();

  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
    function dragOverSquare(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (Number(draggedShip.dataset.gameAreaIndex) !== gameAreaIndex) return;

      const shipIndex = Number(draggedShip.dataset.index);
      const legalShipPlacement = gameData.gameboards[
        gameAreaIndex
      ].legalShipPlacement(shipIndex, position);
      colorizeShipBorder(
        position,
        settings.shipLengths[shipIndex],
        gameAreaIndex,
        legalShipPlacement
      );
    }
    square.addEventListener('dragover', dragOverSquare);
    square.addEventListener('dragleave', uncolorizeShipBorder);

    function updateShipPosition(shipPosition) {
      draggedShip.classList.add('on-gameboard');
      const targetSquare = gameboardSquares.find(
        ({ position: targetPosition, gameAreaIndex: targetGameAreaIndex }) =>
          gameAreaIndex === targetGameAreaIndex &&
          equalsArray(shipPosition, targetPosition)
      ).square;
      targetSquare.appendChild(draggedShip);
    }

    function dropShip() {
      if (Number(draggedShip.dataset.gameAreaIndex) !== gameAreaIndex) return;

      const shipIndex = Number(draggedShip.dataset.index);
      try {
        gameData.gameboards[gameAreaIndex].placeShip(shipIndex, position);
      } catch {
        return;
      }

      updateShipPosition(
        gameData.gameboards[gameAreaIndex].ships[shipIndex].position
      );
      updateGameboardSetUp();
    }
    square.addEventListener('drop', dropShip);
  });

  ships.forEach((ship) => {
    function drag() {
      ship.classList.add('hidden');
    }
    ship.addEventListener('drag', drag);

    function dragStart(e) {
      draggedShip = ship;
      const squareCenter = Number(ship.dataset.squareCenter);
      e.dataTransfer.setDragImage(ship, squareCenter, squareCenter);
      ships.forEach((otherShip) => {
        if (otherShip !== ship && otherShip.classList.contains('on-gameboard'))
          otherShip.closest('.square').classList.add('with-background-ship');
      });
    }
    ship.addEventListener('dragstart', dragStart);

    function dragEnd() {
      ship.classList.remove('hidden');
      uncolorizeShipBorder();
      ships.forEach((otherShip) => {
        otherShip.closest('.square')?.classList?.remove('with-background-ship');
      });
    }
    ship.addEventListener('dragend', dragEnd);
  });
}

export default function startGameboardSetUp() {
  gameView();
  drawGameAreas(gameData.players.map((player) => player.name));
  enableGameboardDragAndDrop();
  updateGameboardSetUp();
}
