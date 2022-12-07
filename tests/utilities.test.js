import * as utilities from '../src/scripts/utilities';

describe('utilities', () => {
  describe('capitalize', () => {
    it('capitalizes a string', () => {
      const string = 'happy';
      const capitalizedString = 'Happy';
      expect(utilities.capitalize(string)).toBe(capitalizedString);
    });
  });

  describe('includesArray', () => {
    it('returns true if the array input is included in the nested array input', () => {
      const array = [1, 2];
      const nestedArray = [
        [2, 3],
        [1, 2],
      ];
      expect(utilities.includesArray(array, nestedArray)).toBe(true);
    });

    it('returns false if the array input is not included in the nested array input', () => {
      const array = [3, 2];
      const nestedArray = [
        [2, 3],
        [1, 2],
        [6, 4],
      ];
      expect(utilities.includesArray(array, nestedArray)).toBe(false);
    });
  });
});
