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
  });
});
