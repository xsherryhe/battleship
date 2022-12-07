import * as utilities from '../src/scripts/utilities';

describe('utilities', () => {
  describe('capitalize', () => {
    it('capitalizes a string', () => {
      const string = 'happy';
      const capitalizedString = 'Happy';
      expect(utilities.capitalize(string)).toBe(capitalizedString);
    });
  });
});
