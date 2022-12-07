import { Attackable, Collectionable, Lengthable } from './composition-units';
import Ship from './ship';

export default function Gameboard({
  shipLengths = [5, 4, 3, 3, 2],
  size = 10,
  attacks = [],
} = {}) {
  return {
    type: 'Gameboard',
    ...Collectionable(
      shipLengths.map((length) => Lengthable(length)),
      'ship',
      Ship,
      { moveable: { areaSize: size }, allMethodNames: ['sunk'] }
    ),
    ...Attackable(attacks, { attackItemName: 'ship' }),
  };
}
