import { HumanPlayer, ComputerPlayer } from '../src/scripts/player';

describe('humanPlayer', () => {
  describe('humanPlayer.type', () => {
    it('is the string "humanPlayer"', () => {
      const humanPlayer = HumanPlayer();
      const type = 'humanPlayer';
      expect(humanPlayer.type).toBe(type);
    });
  });

  describe('humanPlayer.name', () => {
    it('is the name of the player', () => {
      const humanPlayer = HumanPlayer('Bob');
      const name = 'Bob';
      expect(humanPlayer.name).toBe(name);
    });
  });

  describe('humanPlayer.setName', () => {
    it('sets a new name for the player', () => {
      const humanPlayer = HumanPlayer('Bob');
      const name = 'John';
      humanPlayer.setName(name);
      expect(humanPlayer.name).toBe(name);
    });
  });

  describe('humanPlayer.attack', () => {
    it('calls gameboard.receiveAttack on the gameboard input with the coordinate input if it is has not already been attacked', () => {
      const humanPlayer = HumanPlayer();
      const gameboard = { receiveAttack: jest.fn() };
      const coordinate = [7, 3];
      humanPlayer.attack(gameboard, coordinate);
      expect(gameboard.receiveAttack).toHaveBeenCalledWith(coordinate);
    });

    it('returns true if gameboard.receiveAttack returns true', () => {
      const humanPlayer = HumanPlayer();
      const gameboard = { receiveAttack: jest.fn(() => true) };
      const coordinate = [9, 2];
      const attack = humanPlayer.attack(gameboard, coordinate);
      expect(attack).toBe(true);
    });

    it('returns false if gameboard.receiveAttack returns false', () => {
      const humanPlayer = HumanPlayer();
      const gameboard = { receiveAttack: jest.fn(() => false) };
      const coordinate = [2, 5];
      const attack = humanPlayer.attack(gameboard, coordinate);
      expect(attack).toBe(false);
    });

    it('throws an error if the coordinate input has already been attacked', () => {
      const humanPlayer = HumanPlayer();
      const gameboard = { attacks: [[2, 5]], receiveAttack: jest.fn() };
      const coordinate = [2, 5];
      expect(() => humanPlayer.attack(gameboard, coordinate)).toThrow(
        'position has already been attacked'
      );
    });

    it('does not call gameboard.receiveAttack if the coordinate input has already been attacked', () => {
      const humanPlayer = HumanPlayer();
      const gameboard = { attacks: [[1, 8]], receiveAttack: jest.fn() };
      const coordinate = [1, 8];
      try {
        humanPlayer.attack(gameboard, coordinate);
      } catch {
        expect(gameboard.receiveAttack).not.toHaveBeenCalled();
      }
    });
  });

  describe('humanPlayer.takeTurn', () => {
    it('returns a turnTaken value of false', () => {
      const humanPlayer = HumanPlayer();
      expect(humanPlayer.takeTurn().turnTaken).toBe(false);
    });

    it('returns a turnOver value of false', () => {
      const humanPlayer = HumanPlayer();
      expect(humanPlayer.takeTurn().turnOver).toBe(false);
    });
  });
});

describe('computerPlayer', () => {
  describe('computerPlayer.type', () => {
    it('is the string "computerPlayer"', () => {
      const computerPlayer = ComputerPlayer();
      const type = 'computerPlayer';
      expect(computerPlayer.type).toBe(type);
    });
  });

  describe('computerPlayer.name', () => {
    it('is the string "Computer"', () => {
      const computerPlayer = ComputerPlayer('Bob');
      const name = 'Computer';
      expect(computerPlayer.name).toBe(name);
    });
  });

  describe('computerPlayer.attack', () => {
    it('calls gameboard.receiveAttack on the gameboard input with the coordinate input', () => {
      const computerPlayer = ComputerPlayer();
      const gameboard = { receiveAttack: jest.fn() };
      const coordinate = [3, 9];
      computerPlayer.attack(gameboard, coordinate);
      expect(gameboard.receiveAttack).toHaveBeenCalledWith(coordinate);
    });

    it('returns true if gameboard.receiveAttack returns true', () => {
      const computerPlayer = ComputerPlayer();
      const gameboard = { receiveAttack: jest.fn(() => true) };
      const coordinate = [7, 4];
      const attack = computerPlayer.attack(gameboard, coordinate);
      expect(attack).toBe(true);
    });

    it('returns false if gameboard.receiveAttack returns false', () => {
      const computerPlayer = ComputerPlayer();
      const gameboard = { receiveAttack: jest.fn(() => false) };
      const coordinate = [8, 5];
      const attack = computerPlayer.attack(gameboard, coordinate);
      expect(attack).toBe(false);
    });
  });

  describe('computerPlayer.autoAttack', () => {
    it('selects a random position within the gameboard input to attack', () => {
      const computerPlayer = ComputerPlayer();
      const length = 5;
      const gameboard = { length, receiveAttack: jest.fn() };
      computerPlayer.autoAttack(gameboard);
      const withinCoordinates = gameboard.receiveAttack.mock.calls[0][0].every(
        (coord) => coord < length && coord >= 0
      );
      expect(withinCoordinates).toBe(true);
    });

    it('does not select a position on the gameboard input that has already been attacked', () => {
      const computerPlayer = ComputerPlayer();
      const gameboard = {
        length: 2,
        attacks: [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        receiveAttack: jest.fn(),
      };
      const coordinate = [0, 1];
      computerPlayer.autoAttack(gameboard);
      expect(gameboard.receiveAttack.mock.calls[0][0]).toEqual(coordinate);
    });

    it('returns true if gameboard.receiveAttack returns true', () => {
      const computerPlayer = ComputerPlayer();
      const length = 7;
      const gameboard = { length, receiveAttack: jest.fn(() => true) };
      const coordinate = [0, 6];
      const attack = computerPlayer.autoAttack(gameboard, coordinate);
      expect(attack).toBe(true);
    });

    it('returns false if gameboard.receiveAttack returns false', () => {
      const computerPlayer = ComputerPlayer();
      const length = 8;
      const gameboard = { length, receiveAttack: jest.fn(() => false) };
      const coordinate = [7, 5];
      const attack = computerPlayer.autoAttack(gameboard, coordinate);
      expect(attack).toBe(false);
    });
  });

  describe('computerPlayer.takeTurn', () => {
    const gameboard = {};
    const computerPlayer = ComputerPlayer();
    computerPlayer.autoAttack = jest.fn(() => true);

    it('calls computerPlayer.autoAttack on the gameboard input', () => {
      computerPlayer.takeTurn(gameboard);
      expect(computerPlayer.autoAttack).toHaveBeenCalledWith(gameboard);
    });

    it('returns a turnTaken value of true', () => {
      expect(computerPlayer.takeTurn(gameboard).turnTaken).toBe(true);
    });

    it('returns a turnOver value of false if computerPlayer.autoAttack returns true', () => {
      expect(computerPlayer.takeTurn(gameboard).turnOver).toBe(false);
    });

    it('returns a turnOver value of true if computerPlayer.autoAttack returns false', () => {
      computerPlayer.autoAttack.mockReturnValueOnce(false);
      expect(computerPlayer.takeTurn(gameboard).turnOver).toBe(true);
    });
  });
});
