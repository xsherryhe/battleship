import { Sinkable } from './composition-units';

export default function Ship({ length = 2, hits = 0 } = {}) {
  return { ...Sinkable(length, hits) };
}
