import Gameboard from '../src/scripts/gameboard';
import { equalsArray } from '../src/scripts/utilities';
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

    it('returns the new orientation of the ship at the index input', () => {
      const gameboard = Gameboard();
      const index = 3;
      const orientation = 1;
      expect(gameboard.rotateShip(index)).toBe(orientation);
    });

    it('places the ship entirely within the gameboard after being rotated to horizontal', () => {
      const gameboard = Gameboard();
      const index = 1;
      gameboard.placeShip(index, [5, 8]);
      gameboard.rotateShip(index);
      const adjustedCoordinate = [5, 6];
      expect(gameboard.ships[index].position).toEqual(adjustedCoordinate);
    });

    it('places the ship entirely within the gameboard after being rotated to vertical', () => {
      const gameboard = Gameboard();
      const index = 0;
      gameboard.rotateShip(index);
      gameboard.placeShip(index, [9, 1]);
      gameboard.rotateShip(index);
      const adjustedCoordinate = [5, 1];
      expect(gameboard.ships[index].position).toEqual(adjustedCoordinate);
    });

    it('throws an error if the ship area after rotating is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [1, 2]);
      gameboard.placeShip(1, [2, 0]);
      expect(() => gameboard.rotateShip(1)).toThrow('position is illegal');
    });

    it('does not change the ship orientation if the ship area after rotating is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [1, 2]);
      gameboard.placeShip(1, [2, 0]);
      try {
        gameboard.rotateShip(1);
      } catch {
        expect(gameboard.ships[1].orientation).toBe(0);
      }
    });

    it('throws an error if the ship area after rotating is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [3, 6]);
      gameboard.placeShip(1, [2, 4]);
      expect(() => gameboard.rotateShip(1)).toThrow('position is illegal');
    });

    it('does not change the ship orientation if the ship area after rotating is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [3, 6]);
      gameboard.placeShip(1, [2, 4]);
      try {
        gameboard.rotateShip(1);
      } catch {
        expect(gameboard.ships[1].orientation).toBe(0);
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

    it('returns the new position of the ship at the index input', () => {
      const gameboard = Gameboard();
      const index = 3;
      const position = [2, 3];
      expect(gameboard.placeShip(index, position)).toEqual(position);
    });

    it('places the ship vertically entirely within the gameboard', () => {
      const gameboard = Gameboard();
      const index = 1;
      const adjustedCoordinate = [6, 2];
      expect(gameboard.placeShip(index, [8, 2])).toEqual(adjustedCoordinate);
    });

    it('places the ship horizontally entirely within the gameboard', () => {
      const gameboard = Gameboard();
      const index = 0;
      gameboard.rotateShip(index);
      const adjustedCoordinate = [3, 5];
      expect(gameboard.placeShip(index, [3, 9])).toEqual(adjustedCoordinate);
    });

    it('throws an error if the coordinate input is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [0, 0]);
      expect(() => gameboard.placeShip(1, [1, 0])).toThrow(
        'position is illegal'
      );
    });

    it('throws an error if the ship area designated by the coordinate input is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [3, 0]);
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

    it('throws an error if the ship area designated by the coordinate input is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [4, 3]);
      expect(() => gameboard.placeShip(1, [2, 4])).toThrow(
        'position is illegal'
      );
    });

    it('succeeds if the coordinate input only conflicts with the position of the ship input that should be moved', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [0, 0]);
      const newPosition = [0, 1];

      expect(() => gameboard.placeShip(0, newPosition)).not.toThrow();
      gameboard.placeShip(0, newPosition);
      expect(gameboard.ships[0].position).toEqual(newPosition);
    });
  });

  describe('gameboard.unplaceShip', () => {
    it('sets the position of the ship input to something falsy', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [2, 5]);
      gameboard.unplaceShip(0);
      expect(gameboard.ships[0].position).toBeFalsy();
    });
  });

  describe('gameboard.legalShipPlacement', () => {
    it('returns true if the coordinate input is a legal ship placement position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [3, 9]);
      expect(gameboard.legalShipPlacement(2, [4, 1])).toBe(true);
    });

    it('returns false if the coordinate input is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [2, 4]);
      expect(gameboard.legalShipPlacement(2, [4, 4])).toBe(false);
    });

    it('returns false if the ship area designated by the coordinate input is on an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [5, 7]);
      expect(gameboard.legalShipPlacement(2, [4, 7])).toBe(false);
    });

    it('returns false if the coordinate input is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [5, 6]);
      expect(gameboard.legalShipPlacement(2, [5, 7])).toBe(false);
    });

    it('returns false if the ship area designated by the coordinate input is next to an occupied position', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [5, 4]);
      expect(gameboard.legalShipPlacement(2, [3, 3])).toBe(false);
    });

    it('returns true if the coordinate input only conflicts with the position of the same ship input', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [3, 2]);
      expect(gameboard.legalShipPlacement(0, [3, 1])).toBe(true);
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
      const allSamePosition = shipPositions.every((position) =>
        equalsArray(position, shipPositions[0])
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
    it('is an array of objects containing coordinates that have been attacked and whether the attacks hit a ship', () => {
      const attacks = [
        { position: [0, 1], hit: true },
        { position: [5, 6], hit: false },
        { position: [9, 4], hit: true },
      ];
      const gameboard = Gameboard({ attacks });
      expect(gameboard.attacks).toEqual(attacks);
    });
  });

  describe('gameboard.receiveAttack', () => {
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

    it('returns true if a ship was hit', () => {
      const gameboard = Gameboard();
      const { ship } = gameboard.ships[0];
      ship.hit = jest.fn();

      gameboard.placeShip(0, [3, 6]);
      const attack = gameboard.receiveAttack([5, 6]);
      expect(attack).toBe(true);
    });

    it('pushes the coordinate input with a hit value of true to gameboard.attacks if a ship was hit', () => {
      const gameboard = Gameboard();
      const { ship } = gameboard.ships[0];
      ship.hit = jest.fn();

      gameboard.placeShip(0, [1, 7]);
      const coordinate = [2, 7];
      gameboard.receiveAttack(coordinate);
      expect(gameboard.attacks).toContainEqual({
        position: coordinate,
        hit: true,
      });
    });

    it('returns false if a ship was not hit', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [2, 9]);
      const attack = gameboard.receiveAttack([1, 7]);
      expect(attack).toBe(false);
    });

    it('pushes the coordinate input with a hit value of false to gameboard.attacks if a ship was not hit', () => {
      const gameboard = Gameboard();
      gameboard.placeShip(0, [2, 8]);
      const coordinate = [3, 5];
      gameboard.receiveAttack(coordinate);
      expect(gameboard.attacks).toContainEqual({
        position: coordinate,
        hit: false,
      });
    });
  });

  describe('gameboard.sunkShips', () => {
    it('returns the number of gameboard ships that have been sunk', () => {
      const gameboard = Gameboard();
      const sunkShips = 3;
      gameboard.ships.forEach((shipItem, i) => {
        shipItem.ship.isSunk = jest.fn(() => i < sunkShips);
      });
      expect(gameboard.sunkShips()).toBe(sunkShips);
    });
  });

  describe('gameboard.notSunkShips', () => {
    it('returns the number of gameboard ships that have been sunk', () => {
      const gameboard = Gameboard();
      const notSunkShips = 3;
      gameboard.ships.forEach((shipItem, i) => {
        shipItem.ship.isSunk = jest.fn(() => i >= notSunkShips);
      });
      expect(gameboard.notSunkShips()).toBe(notSunkShips);
    });
  });

  describe('gameboard.allSunk', () => {
    it('returns false if not all gameboard ships are sunk', () => {
      const gameboard = Gameboard();
      const [sunkShip, ...ships] = gameboard.ships.map(
        (shipItem) => shipItem.ship
      );
      sunkShip.isSunk = jest.fn(() => true);
      ships.forEach((ship) => {
        ship.isSunk = jest.fn(() => false);
      });

      expect(gameboard.allSunk()).toBe(false);
    });

    it('returns true if all gameboard ships are sunk', () => {
      const gameboard = Gameboard();
      gameboard.ships.forEach((shipItem) => {
        shipItem.ship.isSunk = jest.fn(() => true);
      });

      expect(gameboard.allSunk()).toBe(true);
    });
  });
});
