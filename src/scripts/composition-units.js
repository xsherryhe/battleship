export function Sinkable(length, hits) {
  let hitCount = hits;

  function hit() {
    hitCount += 1;
  }

  function isSunk() {
    return length === hitCount;
  }

  return { hit, isSunk };
}
