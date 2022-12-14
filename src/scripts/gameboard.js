import { Attackable, Collectionable, Lengthable } from './composition-units';
import Ship from './ship';

export default function Gameboard({
  shipLengths = [5, 4, 3, 3, 2],
  length = 10,
  attacks = [],
} = {}) {
  return {
    type: 'Gameboard',
    ...Lengthable(length),
    ...Collectionable(
      shipLengths.map((shipLength) => Lengthable(shipLength)),
      'ship',
      Ship,
      {
        moveable: { areaLength: length },
        allMethodNames: ['sunk'],
        countMethodNames: ['sunk'],
      }
    ),
    ...Attackable(attacks, { attackItemName: 'ship' }),
  };
}
