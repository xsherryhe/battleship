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

  describe('equalsArray', () => {
    it('returns true if the two array inputs have the same contents', () => {
      const array1 = ['a', 3, 7];
      const array2 = ['a', 3, 7];
      expect(utilities.equalsArray(array1, array2)).toBe(true);
    });

    it('returns false if the two array inputs do not have the same contents', () => {
      const array1 = ['b', 4, 2];
      const array2 = ['b', 2, 4];
      expect(utilities.equalsArray(array1, array2)).toBe(false);
    });
  });
});
