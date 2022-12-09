import Gameboard from '../src/scripts/gameboard';
describe('gameboard', () => {
  describe('gameboard.type', () => {
    it('is the string "Gameboard"', () => {
      const gameboard = Gameboard();
      const type = 'Gameboard';
      expect(gameboard.type).toBe(type);
    });
  });

  describe('gameboard.length', () => {
    it('is the length of the gameboard', () => {
      const gameboard = Gameboard({ length: 8 });
      const length = 8;
      expect(gameboard.length).toBe(length);
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

    it('throws an error if the coordinate input is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [0, 0]);
      expect(() => gameboard.placeShip(1, [1, 0])).toThrow(
        'position is illegal'
      );
    });

    it('throws an error if the coordinate input is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [0, 0]);
      expect(() => gameboard.placeShip(1, [0, 1])).toThrow(
        'position is illegal'
      );
    });
  });

  describe('gameboard.allShipsPlaced', () => {
    it('returns false if not all ships on the gameboard have a position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(2, [4, 6]);
      expect(gameboard.allShipsPlaced()).toBe(false);
    });

    it('returns true if all ships on the gameboard have a position', () => {
      const gameboard = Gameboard();
      for (let i = 0; i < 5; i += 1) gameboard.placeShip(i, [0, i * 2]);
      expect(gameboard.allShipsPlaced()).toBe(true);
    });
  });

  describe('gameboard.autoPlaceShips', () => {
    it('gives places all ships on the gameboard', () => {
      const gameboard = Gameboard();
      gameboard.autoPlaceShips();
      expect(gameboard.allShipsPlaced()).toBe(true);
    });

    it('randomizes the position of the ships', () => {
      // Probabilistic with a probabilility of >99.99999%
      const shipPositions = [];
      for (let i = 0; i < 6; i += 1) {
        const gameboard = Gameboard();
        gameboard.autoPlaceShips();
        shipPositions.push(gameboard.ships[0].position);
      }
      const allSamePosition = shipPositions.every(
        ([row, col]) =>
          row === shipPositions[0][0] && col === shipPositions[0][1]
      );
      expect(allSamePosition).toBe(false);
    });

    it('randomizes the orientation of the ships', () => {
      // Probabilistic with a probabilility of >99.999%
      const shipOrientations = [];
      for (let i = 0; i < 20; i += 1) {
        const gameboard = Gameboard();
        gameboard.autoPlaceShips();
        shipOrientations.push(gameboard.ships[0].orientation);
      }
      expect(shipOrientations).toContain(0);
      expect(shipOrientations).toContain(1);
    });
  });

  describe('gameboard.attacks', () => {
    it('is an array of coordinates that have been attacked', () => {
      const attacks = [
        [0, 1],
        [5, 6],
        [9, 4],
      ];
      const gameboard = Gameboard({ attacks });
      expect(gameboard.attacks).toEqual(attacks);
    });
  });

  describe('gameboard.receiveAttack', () => {
    it('pushes the coordinate input to gameboard.attacks', () => {
      const gameboard = Gameboard();
      const coordinate = [2, 7];
      gameboard.receiveAttack(coordinate);
      expect(gameboard.attacks).toContain(coordinate);
    });

    it('calls ship.hit on a ship positioned at the coordinate input', () => {
      const gameboard = Gameboard();
      const { ship } = gameboard.ships[0];
      ship.hit = jest.fn();

      gameboard.placeShip(0, [1, 3]);
      gameboard.receiveAttack([4, 3]);
      expect(ship.hit).toHaveBeenCalled();
    });

    it('does not call ship.hit on a ship not positioned at the coordinate input', () => {
      const gameboard = Gameboard();
      const { ship } = gameboard.ships[0];
      ship.hit = jest.fn();

      gameboard.placeShip(0, [1, 3]);
      gameboard.receiveAttack([1, 4]);
      expect(ship.hit).not.toHaveBeenCalled();
    });
  });

  describe('gameboard.allSunk', () => {
    it('returns false if not all gameboard ships are sunk', () => {
      const gameboard = Gameboard();
      const [sunkShip, ...ships] = gameboard.ships.map(
        (shipItem) => shipItem.ship
      );
      sunkShip.isSunk = jest.fn().mockReturnValue(true);
      ships.forEach((ship) => {
        ship.isSunk = jest.fn().mockReturnValue(false);
      });

      expect(gameboard.allSunk()).toBe(false);
    });

    it('returns true if all gameboard ships are sunk', () => {
      const gameboard = Gameboard();
      gameboard.ships.forEach((shipItem) => {
        shipItem.ship.isSunk = jest.fn().mockReturnValue(true);
      });

      expect(gameboard.allSunk()).toBe(true);
    });
  });
});
