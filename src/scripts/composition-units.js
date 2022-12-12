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
  function itemArea(position = this.position) {
    const area = [];
    if (position === undefined || this.orientation === undefined) return area;

    const coordIndex = this.orientation;
    for (let i = 0; i < this[collectionItemName].length; i += 1) {
      const coordinate = [...position];
      coordinate[coordIndex] += i;
      area.push(coordinate);
    }

    return area;
  }

  collection.forEach((collectionItem) =>
    Object.assign(collectionItem, { orientation: 0, area: itemArea })
  );

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

  function getBorderingArea(area) {
    return area.reduce((borderingArea, [row, col]) => {
      const borderingPositions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, 1],
      ]
        .map(([rowOffset, colOffset]) => [row + rowOffset, col + colOffset])
        .filter((borderingPosition) => !includesArray(borderingPosition, area));
      return [...borderingArea, ...borderingPositions];
    }, []);
  }

  function illegalPositions({ excluding } = {}) {
    return collection.reduce((positions, collectionItem, collectionIndex) => {
      if (!collectionItem.position || excluding.includes(collectionIndex))
        return positions;

      const collectionItemArea = collectionItem.area();
      return [
        ...positions,
        ...collectionItemArea,
        ...getBorderingArea(collectionItemArea),
      ];
    }, []);
  }

  function legalPlacement(collectionIndex, position) {
    return collection[collectionIndex]
      .area(position)
      .every(
        (areaPosition) =>
          !includesArray(
            areaPosition,
            illegalPositions({ excluding: [collectionIndex] })
          )
      );
  }

  function place(collectionIndex, position) {
    const collectionItem = collection[collectionIndex];
    const clampedPosition = clampToArea(position, collectionItem);
    if (!legalPlacement(collectionIndex, clampedPosition))
      throw new Error('This position is illegal!');

    collectionItem.position = clampedPosition;
    return collectionItem.position;
  }

  function allPlaced() {
    return collection.every((collectionItem) => collectionItem.position);
  }

  function rotate(collectionIndex) {
    const collectionItem = collection[collectionIndex];
    collectionItem.orientation = 1 - collectionItem.orientation;
    return collectionItem.orientation;
  }

  function getRandomPosition() {
    return [...new Array(2)].map(() => Math.floor(Math.random() * areaLength));
  }

  function autoPlace() {
    collection.forEach((collectionItem, i) => {
      if (Math.floor(Math.random() * 2)) rotate(i);
      while (!collectionItem.position) {
        try {
          place(i, getRandomPosition());
        } catch {
          // Do nothing
        }
      }
    });
  }

  const capitalizedCollectionItem = capitalize(collectionItemName);

  return {
    [`place${capitalizedCollectionItem}`]: place,
    [`legal${capitalizedCollectionItem}Placement`]: legalPlacement,
    [`all${capitalizedCollectionItem}sPlaced`]: allPlaced,
    [`rotate${capitalizedCollectionItem}`]: rotate,
    [`autoPlace${capitalizedCollectionItem}s`]: autoPlace,
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

export function Nameable(name) {
  function setName(newName) {
    this.name = newName;
  }

  return { name, setName };
}

export function Attackable(attacks, { attackItemName } = {}) {
  function sendAttackToItems(attackItems, position) {
    attackItems.forEach((attackItem) => {
      if (includesArray(position, attackItem.area()))
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

export function TurnTaking({ method = '' } = {}) {
  function takeTurn(data) {
    if (!method) return false;

    this[method](data);
    return true;
  }

  return { takeTurn };
}
