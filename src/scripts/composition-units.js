import { capitalize, includesArray } from './utilities';

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
  areaLength = Infinity
) {
  function clampToArea(position, item) {
    const maxes = [
      areaLength - item[collectionItemName].length,
      areaLength - 1,
    ];
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
          moveable.areaLength || Infinity
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
      if (includesArray(position, attackItemArea(attackItem)))
        attackItem[attackItemName].hit();
    });
  }

  function receiveAttack(position) {
    attacks.push(position);
    if (attackItemName) sendAttackToItems(this[`${attackItemName}s`], position);
  }

  return { attacks, receiveAttack };
}

function AutoAttacking() {
  function randomAttackPosition(target) {
    return [...new Array(2)].map(() =>
      Math.floor(Math.random() * target.length)
    );
  }

  function autoAttack(target) {
    let position = randomAttackPosition(target);
    while (includesArray(position, target.attacks || []))
      position = randomAttackPosition(target);
    this.attack(target, position);
  }

  return { autoAttack };
}

export function Attacking({ auto = false } = {}) {
  function attack(target, position) {
    if (includesArray(position, target.attacks || []))
      throw new Error('That position has already been attacked!');
    target.receiveAttack(position);
  }

  return { attack, ...(auto ? AutoAttacking() : {}) };
}
