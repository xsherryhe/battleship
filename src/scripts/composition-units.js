import { capitalize } from './utilities';

export function Lengthable(length) {
  return { length };
}

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

function CollectionMoveable(collection, collectionItemName, areaSize) {
  function clampToArea(position, item) {
    const maxes = [areaSize - item[collectionItemName].length, areaSize - 1];
    const itemMaxes = item.orientation === 0 ? maxes : [...maxes].reverse();

    return position.map((coord, i) =>
      Math.max(0, Math.min(itemMaxes[i], coord))
    );
  }

  function place(collectionIndex, position) {
    const collectionItem = collection[collectionIndex];
    collectionItem.position = clampToArea(position, collectionItem);
  }

  function rotate(collectionIndex) {
    const collectionItem = collection[collectionIndex];
    collectionItem.orientation = [1, 0][collectionItem.orientation];
  }

  return {
    [`place${capitalize(collectionItemName)}`]: place,
    [`rotate${capitalize(collectionItemName)}`]: rotate,
  };
}

export function Collectionable(
  collectionData,
  collectionItemName,
  collectionItemFactory,
  { moveable = false } = {}
) {
  const collection = collectionData.map((data) => ({
    [collectionItemName]: collectionItemFactory(data),
    ...(moveable ? { orientation: 0 } : {}),
  }));

  return {
    [`${collectionItemName}s`]: collection,
    ...(moveable
      ? CollectionMoveable(collection, collectionItemName, moveable.areaSize)
      : {}),
  };
}
