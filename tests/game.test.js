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
  default: jest.fn(() => ({
    autoPlaceShips: jest.fn(),
  })),
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
  it('sets the player mode of the game to 0 by default', () => {
    delete gameData.modes;
    initializeGame();
    expect(gameData.modes.playerMode).toBe(0);
  });

  it('sets the player mode of the game to the player mode input', () => {
    initializeGame({ playerMode: 1 });
    expect(gameData.modes.playerMode).toBe(1);
  });

  it('populates the gameboards array with two new gameboards with default lengths', () => {
    initializeGame();
    expect(Gameboard.mock.calls).toEqual([
      [{ length: 10, shipLengths: [5, 4, 3, 3, 2] }],
      [{ length: 10, shipLengths: [5, 4, 3, 3, 2] }],
    ]);
    expect(gameData.gameboards).toHaveLength(2);
  });

  it('populates the gameboards array with two new gameboards with custom length inputs', () => {
    initializeGame({ gameboardLength: 2, shipLengths: [6, 2, 4, 4, 5, 1] });
    expect(Gameboard.mock.calls).toEqual([
      [{ length: 2, shipLengths: [6, 2, 4, 4, 5, 1] }],
      [{ length: 2, shipLengths: [6, 2, 4, 4, 5, 1] }],
    ]);
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

    it('calls autoPlaceShips on the gameboard of the computer player', () => {
      initializeGame();
      const gameboard =
        gameData.gameboards[
          gameData.players.findIndex(
            (player) => player.type === 'computerPlayer'
          )
        ];
      expect(gameboard.autoPlaceShips).toHaveBeenCalled();
    });

    it('does not call autoPlaceShips on the gameboard of the human player', () => {
      initializeGame();
      const gameboard =
        gameData.gameboards[
          gameData.players.findIndex((player) => player.type === 'humanPlayer')
        ];
      expect(gameboard.autoPlaceShips).not.toHaveBeenCalled();
    });
  });

  describe('in two-player mode', () => {
    it('creates two human players', () => {
      initializeGame({ playerMode: 1 });
      expect(HumanPlayer.mock.calls).toEqual([[], []]);
    });

    it('does not call autoPlaceShips on any gameboard', () => {
      initializeGame({ playerMode: 1 });
      gameData.gameboards.forEach((gameboard) => {
        expect(gameboard.autoPlaceShips).not.toHaveBeenCalled();
      });
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
      player.takeTurn = jest.fn(() => ({ turnTaken: false, turnOver: false }));
    });
    gameData.gameboards.forEach((gameboard) => {
      gameboard.allSunk = jest.fn();
    });
  });

  it('does not call takeTurn for the next player if the current player did not take a turn', () => {
    playGame();
    expect(gameData.players[1].takeTurn).not.toHaveBeenCalled();
  });

  it('calls takeTurn for the current player on the opposing gameboard if the current player took a turn externally but did not complete their turn', () => {
    playGame({ currentTurnTaken: true, currentTurnOver: false });
    expect(gameData.players[0].takeTurn).toHaveBeenCalledWith(
      gameData.gameboards[1]
    );
  });

  it('calls takeTurn for the next player on the opposing gameboard if the current player completed a turn externally', () => {
    playGame({ currentTurnTaken: true, currentTurnOver: true });
    expect(gameData.players[1].takeTurn).toHaveBeenCalledWith(
      gameData.gameboards[0]
    );
  });

  it('calls takeTurn for the current player on the opposing gameboard if the current player took a turn internally but did not complete their turn', () => {
    gameData.players[0].takeTurn
      .mockImplementationOnce(() => ({
        turnTaken: true,
        turnOver: false,
      }))
      .mockImplementationOnce(() => ({
        turnTaken: true,
        turnOver: true,
      }));

    playGame();
    expect(gameData.players[0].takeTurn.mock.calls).toEqual([
      [gameData.gameboards[1]],
      [gameData.gameboards[1]],
    ]);
  });

  it('calls takeTurn for the next player on the opposing gameboard if the current player completed a turn internally', () => {
    gameData.players[0].takeTurn = jest.fn(() => ({
      turnTaken: true,
      turnOver: true,
    }));
    playGame();
    expect(gameData.players[1].takeTurn).toHaveBeenCalledWith(
      gameData.gameboards[0]
    );
  });

  it('calls takeTurn for alternating players for as long as they continue to complete turns', () => {
    function takeTurnExpectation(iteration, playerIndex) {
      expect(gameData.players[playerIndex].takeTurn).toHaveBeenCalledTimes(
        iteration
      );
    }

    gameData.players[0].takeTurn = jest.fn(() => ({
      turnTaken: true,
      turnOver: true,
    }));
    gameData.players[1].takeTurn
      .mockImplementationOnce(() => {
        takeTurnExpectation(1, 0);
        takeTurnExpectation(1, 1);
        return { turnTaken: true, turnOver: true };
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(2, 0);
        takeTurnExpectation(2, 1);
        return { turnTaken: true, turnOver: true };
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(3, 0);
        takeTurnExpectation(3, 1);
        return { turnTaken: true, turnOver: true };
      })
      .mockImplementationOnce(() => {
        takeTurnExpectation(4, 0);
        takeTurnExpectation(4, 1);
        return { turnTaken: true, turnOver: true };
      });

    playGame();
  });

  it('sets game-over to be true if one of the gameboards has all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => ({
      turnTaken: true,
      turnOver: true,
    }));
    gameData.gameboards[0].allSunk = jest.fn(() => true);
    playGame();
    expect(gameData.gameOver).toBe(true);
  });

  it('sets game-over to be true if a turn causes one of the gameboards to have all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => {
      gameData.gameboards[0].allSunk = jest.fn(() => true);
      return {
        turnTaken: true,
        turnOver: false,
      };
    });

    playGame();
    expect(gameData.gameOver).toBe(true);
  });

  it('does not set game-over to be true if none of the gameboards have all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => ({
      turnTaken: true,
      turnOver: true,
    }));
    playGame();
    expect(gameData.gameOver).toBe(false);
  });

  it('stops calling takeTurn once one of the gameboards has all ships sunk', () => {
    gameData.players[0].takeTurn = jest.fn(() => ({
      turnTaken: true,
      turnOver: true,
    }));
    gameData.players[1].takeTurn
      .mockImplementationOnce(() => ({ turnTaken: true, turnOver: true }))
      .mockImplementationOnce(() => {
        gameData.gameboards[0].allSunk = jest.fn(() => true);
        return { turnTaken: true, turnOver: true };
      });

    playGame();
    gameData.players.forEach((player) =>
      expect(player.takeTurn).toHaveBeenCalledTimes(2)
    );
  });
});
