import { capitalize, equalsArray, includesArray } from './utilities';

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
    if (!position || this.orientation === undefined) return area;

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
        [-1, -1],
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

  function unplace(collectionIndex) {
    collection[collectionIndex].position = null;
  }

  function allPlaced() {
    return collection.every((collectionItem) => collectionItem.position);
  }

  function rotate(collectionIndex) {
    const collectionItem = collection[collectionIndex];
    collectionItem.orientation = 1 - collectionItem.orientation;
    if (collectionItem.position)
      try {
        place(collectionIndex, collectionItem.position);
      } catch (error) {
        rotate(collectionIndex);
        throw error;
      }

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
    [`unplace${capitalizedCollectionItem}`]: unplace,
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
  { moveable = false, allMethodNames = [], countMethodNames = [] } = {}
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

  const countMethods = countMethodNames.reduce((methods, method) => {
    const capitalizedMethod = capitalize(method);
    const capitalizedCollectionItem = capitalize(collectionItemName);
    function countMethod(boolean) {
      return collection.filter(
        (collectionItem) =>
          collectionItem[collectionItemName][`is${capitalizedMethod}`]() ===
          boolean
      ).length;
    }

    function countYesMethod() {
      return countMethod(true);
    }

    function countNoMethod() {
      return countMethod(false);
    }

    return {
      ...methods,
      [`${method}${capitalizedCollectionItem}s`]: countYesMethod,
      [`not${capitalizedMethod}${capitalizedCollectionItem}s`]: countNoMethod,
    };
  }, {});

  return {
    [`${collectionItemName}s`]: collection,
    ...allMethods,
    ...countMethods,
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
    for (let i = 0; i < attackItems.length; i += 1) {
      const attackItem = attackItems[i];
      if (includesArray(position, attackItem.area())) {
        attackItem[attackItemName].hit();
        return true;
      }
    }
    return false;
  }

  function receiveAttack(position) {
    let hit = true;
    if (attackItemName)
      hit = sendAttackToItems(this[`${attackItemName}s`], position);
    attacks.push({ position, hit });
    return hit;
  }

  return { attacks, receiveAttack };
}

export function Attacking({ auto = false } = {}) {
  function alreadyAttacked(target, position) {
    const previousPositions = (target.attacks || []).map(
      (previousAttack) => previousAttack.position
    );
    return includesArray(position, previousPositions);
  }

  function attack(target, position) {
    if (alreadyAttacked(target, position))
      throw new Error('That position has already been attacked!');
    return target.receiveAttack(position);
  }

  function AutoAttacking() {
    function randomAttackPosition(target) {
      return [...new Array(2)].map(() =>
        Math.floor(Math.random() * target.length)
      );
    }

    function validPosition(target, position) {
      return (
        position &&
        position.every(
          (coordinate) => coordinate >= 0 && coordinate < target.length
        )
      );
    }

    const missPositions = [];
    function updateMissPositions([row, col]) {
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].forEach(([rowOffset, colOffset]) => {
        missPositions.push([row + rowOffset, col + colOffset]);
      });
    }

    const nextAttackPositions = [];
    function updateNextAttackPositions([row, col]) {
      const offsets = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      while (offsets.length) {
        const randomIndex = Math.floor(Math.random() * offsets.length);
        const [rowOffset, colOffset] = offsets.splice(randomIndex, 1)[0];
        nextAttackPositions.push([row + rowOffset, col + colOffset]);
      }
    }

    function updatePositionData(position) {
      updateMissPositions(position);
      updateNextAttackPositions(position);
    }

    function autoAttack(target) {
      let position;
      while (
        !validPosition(target, position) ||
        includesArray(position, missPositions) ||
        alreadyAttacked(target, position)
      )
        position = nextAttackPositions.pop() || randomAttackPosition(target);

      const success = this.attack(target, position);
      if (success) updatePositionData(position);
      return success;
    }

    return { autoAttack };
  }

  return { attack, ...(auto ? AutoAttacking() : {}) };
}

export function TurnTaking({ method = null } = {}) {
  function takeTurn(data) {
    if (!method) return false;

    this[method](data);
    return true;
  }

  return { takeTurn };
}
