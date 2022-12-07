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

function CollectionMoveable(
  collection,
  collectionItemName,
  areaSize = Infinity
) {
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
  { moveable = false, allMethodNames = [] } = {}
) {
  const collection = collectionData.map((data) => ({
    [collectionItemName]: collectionItemFactory(data),
    ...(moveable ? { orientation: 0 } : {}),
  }));

  const allMethods = allMethodNames.reduce((methods, method) => {
    const capitalizedMethod = capitalize(method);
    function allMethod() {
      return collection.every((collectionItem) =>
        collectionItem[collectionItemName][`is${capitalizedMethod}`]()
      );
    }

    return {
      ...methods,
      [`all${capitalizedMethod}`]: allMethod,
    };
  }, {});

  return {
    [`${collectionItemName}s`]: collection,
    ...allMethods,
    ...(moveable
      ? CollectionMoveable(
          collection,
          collectionItemName,
          moveable.areaSize || Infinity
        )
      : {}),
  };
}

export function Attackable(attacks, { attackItemName } = {}) {
  function attackItemArea(attackItem) {
    const area = [];
    if (
      attackItem.position === undefined ||
      attackItem.orientation === undefined
    )
      return area;

    const coordIndex = attackItem.orientation;
    for (let i = 0; i < attackItem[attackItemName].length; i += 1) {
      const coordinate = [...attackItem.position];
      coordinate[coordIndex] += i;
      area.push(coordinate);
    }

    return area;
  }

  function sendAttackToItems(attackItems, position) {
    attackItems.forEach((attackItem) => {
      const itemHit = attackItemArea(attackItem).some((areaPosition) =>
        position.every((coord, i) => coord === areaPosition[i])
      );
      if (itemHit) attackItem[attackItemName].hit();
    });
  }

  function receiveAttack(position) {
    attacks.push(position);
    if (attackItemName) sendAttackToItems(this[`${attackItemName}s`], position);
  }

  return { attacks, receiveAttack };
}
