import Gameboard from '../src/scripts/gameboard';

describe('gameboard', () => {
  describe('gameboard.type', () => {
    it('is the string "Gameboard"', () => {
      const gameboard = Gameboard();
      const type = 'Gameboard';
      expect(gameboard.type).toBe(type);
    });
  });

  describe('gameboard.ships', () => {
    it('is a non-empty array of objects containing ships for the gameboard', () => {
      const gameboard = Gameboard();
      const gameboardShips = gameboard.ships;
      const allShips = gameboard.ships.every(
        (ship) => ship.ship.type === 'Ship'
      );
      expect(gameboardShips.length).toBeGreaterThan(0);
      expect(allShips).toBe(true);
    });

    it('can take and show a custom array of objects containing ships', () => {
      const shipLengths = [1, 1, 2, 2];
      const gameboard = Gameboard({ shipLengths });
      const numberOfShips = 4;
      expect(gameboard.ships).toHaveLength(numberOfShips);
      expect(gameboard.ships.map((ship) => ship.ship.length)).toEqual(
        shipLengths
      );
    });
  });

  describe('gameboard.rotateShip', () => {
    it('toggles the orientation of the ship at the index input', () => {
      const gameboard = Gameboard();
      const index = 4;
      for (let i = 1; i < 5; i += 1) {
        gameboard.rotateShip(index);
        expect(gameboard.ships[index].orientation).toBe(i % 2);
      }
    });
  });

  describe('gameboard.placeShip', () => {
    it('places the ship with the index input at the coordinate input', () => {
      const gameboard = Gameboard();
      const coordinate = [1, 5];
      const index = 2;
      gameboard.placeShip(index, coordinate);
      expect(gameboard.ships[index].position).toEqual(coordinate);
    });

    it('places the ship vertically entirely within the gameboard', () => {
      const gameboard = Gameboard();
      const index = 1;
      gameboard.placeShip(index, [8, 2]);
      const adjustedCoordinate = [6, 2];
      expect(gameboard.ships[index].position).toEqual(adjustedCoordinate);
    });

    it('places the ship horizontally entirely within the gameboard', () => {
      const gameboard = Gameboard();
      const index = 0;
      gameboard.rotateShip(index);
      gameboard.placeShip(index, [3, 9]);
      const adjustedCoordinate = [3, 5];
      expect(gameboard.ships[index].position).toEqual(adjustedCoordinate);
    });
  });
});
