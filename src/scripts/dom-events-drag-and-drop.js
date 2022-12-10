import { gameboardSquareDivs, shipDivs, shipDiv } from './dom-elements';
import { colorizeShipBorder } from './views';
import { gameData } from './game';
import * as settings from './settings';
import { equalsArray } from './utilities';

export default function enableGameboardDragAndDrop() {
  const gameboardSquares = [...gameboardSquareDivs()].map((square) => ({
    square,
    position: [
      Math.floor(square.dataset.index / 10),
      square.dataset.index % 10,
    ],
    gameAreaIndex: Number(square.closest('.game-area').dataset.index),
  }));

  gameboardSquares.forEach(({ square, position, gameAreaIndex }) => {
    function dragOverSquare(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const [shipGameAreaIndex, shipIndex] = e.dataTransfer
        .getData('text/plain')
        .split(',')
        .map(Number);
      if (shipGameAreaIndex !== gameAreaIndex) return;

      colorizeShipBorder(position, settings.shipLengths[shipIndex]);
    }
    square.addEventListener('dragover', dragOverSquare);

    function updateShipPosition(shipIndex, shipPosition) {
      const ship = shipDiv(gameAreaIndex, shipIndex);
      ship.style.position = 'absolute';

      const targetSquare = gameboardSquares.find(
        ({ position: targetPosition }) =>
          equalsArray(shipPosition, targetPosition)
      ).square;
      targetSquare.appendChild(ship);
    }

    function dropShip(e) {
      const [shipGameAreaIndex, shipIndex] = e.dataTransfer
        .getData('text/plain')
        .split(',')
        .map(Number);
      if (shipGameAreaIndex !== gameAreaIndex) return;

      try {
        gameData.gameboards[gameAreaIndex].placeShip(shipIndex, position);
      } catch {
        return;
      }

      updateShipPosition(
        shipIndex,
        gameData.gameboards[gameAreaIndex].ships[shipIndex].position
      );
    }
    square.addEventListener('drop', dropShip);
  });

  shipDivs().forEach((ship) => {
    function drag(e) {
      e.dataTransfer.setData(
        'text/plain',
        `${ship.dataset.gameAreaIndex},${ship.dataset.index}`
      );

      const squareCenter = Number(ship.dataset.squareCenter);
      e.dataTransfer.setDragImage(ship, squareCenter, squareCenter);
    }
    ship.addEventListener('dragstart', drag);

    function dragOverShip(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      ship.style.zIndex = 0;
    }
    ship.addEventListener('dragover', dragOverShip);

    function dragEnd() {
      shipDivs().forEach((dragEndShip) => {
        dragEndShip.style.zIndex = 1;
      });
    }
    ship.addEventListener('dragend', dragEnd);
  });
}
