import { Attacking, Nameable } from './composition-units';

export function HumanPlayer(name = 'Player') {
  return { type: 'humanPlayer', ...Nameable(name), ...Attacking() };
}

export function ComputerPlayer() {
  return {
    type: 'computerPlayer',
    ...Nameable('Computer'),
    ...Attacking({ auto: true }),
  };
}
