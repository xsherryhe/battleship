import { Attacking } from './composition-units';

export function HumanPlayer() {
  return { ...Attacking() };
}

export function ComputerPlayer() {
  return { ...Attacking({ auto: true }) };
}
