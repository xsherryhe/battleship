import Ship from '../src/scripts/ship';

describe('ship', () => {
  describe('ship.isSunk', () => {
    it('returns false if the number of hits does not equal the ship length', () => {
      const ship = Ship({ length: 3, hits: 2 });
      expect(ship.isSunk()).toBe(false);
    });

    it('returns true if the number of hits equals the ship length', () => {
      const ship = Ship({ length: 4, hits: 4 });
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('ship.hit', () => {
    it('does not sink the ship if the number of hit calls does not equal the ship length', () => {
      const ship = Ship({ length: 3 });
      for (let i = 0; i < 2; i++) ship.hit();
      expect(ship.isSunk()).toBe(false);
    });

    it('sinks the ship if the number of hit calls equals the ship length', () => {
      const ship = Ship({ length: 5 });
      for (let i = 0; i < 5; i++) ship.hit();
      expect(ship.isSunk()).toBe(true);
    });
  });
});
