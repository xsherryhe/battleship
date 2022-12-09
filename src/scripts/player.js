import { Attacking, TurnTaking, Nameable } from './composition-units';

export function HumanPlayer(name = 'Player') {
  return {
    type: 'humanPlayer',
    ...Nameable(name),
    ...Attacking(),
    ...TurnTaking(),
  };
}

export function ComputerPlayer() {
  return {
    type: 'computerPlayer',
    ...Nameable('Computer'),
    ...Attacking({ auto: true }),
    ...TurnTaking({ method: 'autoAttack' }),
  };
}
