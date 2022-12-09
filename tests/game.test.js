import {
  initializeGame,
  currGameboard,
  currPlayer,
  playGame,
  gameData,
} from '../src/scripts/game';
import Gameboard from '../src/scripts/gameboard';
import { HumanPlayer, ComputerPlayer } from '../src/scripts/player';

jest.mock('../src/scripts/gameboard', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('../src/scripts/player', () => ({
  __esModule: true,
  HumanPlayer: jest.fn(() => ({
    type: 'humanPlayer',
  })),
  ComputerPlayer: jest.fn(() => ({
    type: 'computerPlayer',
    autoAttack: jest.fn(),
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const initialGameData = { ...gameData };
afterAll(() => {
  Object.keys(gameData).forEach((key) => delete gameData[key]);
  Object.assign(gameData, initialGameData);
});

describe('initializeGame', () => {
  it('populates the gameboards array with two new gameboards', () => {
    initializeGame();
    expect(Gameboard.mock.calls).toEqual([[], []]);
    expect(gameData.gameboards).toHaveLength(2);
  });

  it('populates the players array with two new players', () => {
    initializeGame();
    expect(gameData.players).toHaveLength(2);
  });

  it('sets the current player index to 0', () => {
    delete gameData.currPlayerIndex;
    initializeGame();
    expect(gameData.currPlayerIndex).toBe(0);
  });

  it('sets the game-over status to false', () => {
    delete gameData.gameOver;
    initializeGame();
    expect(gameData.gameOver).toBe(false);
  });

  describe('in one-player mode', () => {
    it('creates one human player', () => {
      initializeGame();
      expect(HumanPlayer.mock.calls).toEqual([[]]);
    });

    it('creates one computer player', () => {
      initializeGame();
      expect(ComputerPlayer.mock.calls).toEqual([[]]);
    });

    it('randomizes the order of players', () => {
      // Probabilistic with a probabilility of >99.999%
      const humanPlayerIndices = [];
      for (let i = 0; i < 20; i += 1) {
        initializeGame();
        const humanPlayerIndex = gameData.players.findIndex(
          (player) => player.type === 'humanPlayer'
        );
        humanPlayerIndices.push(humanPlayerIndex);
      }
      expect(humanPlayerIndices).toContain(0);
      expect(humanPlayerIndices).toContain(1);
    });
  });

  describe('in two-player mode', () => {
    it('creates two human players', () => {
      initializeGame({ playerMode: 1 });
      expect(HumanPlayer.mock.calls).toEqual([[], []]);
    });
  });
});

describe('currGameboard', () => {
  it('returns the gameboard of the opponent of the current player', () => {
    initializeGame();
    const gameboard = gameData.gameboards[1];
    expect(currGameboard()).toBe(gameboard);
  });
});

describe('currPlayer', () => {
  it('returns the current player', () => {
    initializeGame();
    gameData.currPlayerIndex = 1;
    expect(currPlayer()).toBe(gameData.players[1]);
  });
});

describe('playGame', () => {
  beforeEach(() => {
    initializeGame();
    gameData.players.forEach((player) => {
      player.takeTurn = jest.fn(() => false);
    });
    gameData.gameboards.forEach((gameboard) => {
      gameboard.allSunk = jest.fn();
    });
  });

  it('does not call takeTurn for the next player if the current player did not take a turn', () => {
    playGame();
    expect(gameData.players[1].takeTurn).not.toHaveBeenCalled();
  });

  it('calls takeTurn for the next player on the opposing gameboard if the current player took a turn externally', () => {
    playGame(true);
    expect(gameData.players[1].takeTurn).toHaveBeenCalledWith(
      gameData.gameboards[0]
    );
  });

  it('calls takeTurn for the next player on the opposing gameboard if the current player took a turn internally', () => {
    gameData.players[0].takeTurn = jest.fn(() => true);
    playGame();
    expect(gameData.players[1].takeTurn).toHaveBeenCalledWith(
      gameData.gameboards[0]
    );
  });

  it('calls takeTurn for alternating players for as long as they continue to take turns', () => {
    function takeTurnExpectation(iteration, playerIndex) {
      expect(gameData.players[playerIndex].takeTurn).toHaveBeenCalledTimes(
        iteration
      );
    }

    gameData.players[0].takeTurn = jest.fn(() => true);
    gameData.players[1].takeTurn
      .mockImplementationOnce(() => {
        takeTurnExpectation(1, 0);
        takeTurnExpectation(1, 1);
        return true;
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(2, 0);
        takeTurnExpectation(2, 1);
        return true;
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(3, 0);
        takeTurnExpectation(3, 1);
        return true;
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(4, 0);
        takeTurnExpectation(4, 1);
        return false;
      });

    playGame();
  });

  it('sets game-over to be true if one of the gameboards has all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => true);
    gameData.gameboards[0].allSunk = jest.fn(() => true);
    playGame();
    expect(gameData.gameOver).toBe(true);
  });

  it('sets game-over to be true if a turn causes one of the gameboards to have all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => {
      gameData.gameboards[0].allSunk = jest.fn(() => true);
      return true;
    });

    playGame();
    expect(gameData.gameOver).toBe(true);
  });

  it('does not set game-over to be true if none of the gameboards have all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => true);
    playGame();
    expect(gameData.gameOver).toBe(false);
  });

  it('stops calling takeTurn once one of the gameboards has all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => true);
    gameData.players[1].takeTurn
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => {
        gameData.gameboards[0].allSunk = jest.fn(() => true);
        return true;
      });

    playGame();
    gameData.players.forEach((player) =>
      expect(player.takeTurn).toHaveBeenCalledTimes(2)
    );
  });
});
