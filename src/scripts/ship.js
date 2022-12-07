import { Lengthable, Sinkable } from './composition-units';

export default function Ship({ length = 2, hits = 0 } = {}) {
  return { type: 'Ship', ...Lengthable(length), ...Sinkable(length, hits) };
}
