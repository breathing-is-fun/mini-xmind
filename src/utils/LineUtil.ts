// Generally speaking, `from` is the target, `to` is the relative
//   _________
//  |         |
//  | target  |
//  |_________|
//      |                  =======> bottom right
//      |         _____________
//      |________|            |
//               |  relative  |
//               |____________|
//
//
//                               _________
//                              |         |
//                              | target  |
//                              |_________|
//                                            =======> bottom left
//             _____________
//            |            |
//            |  relative  |
//            |____________|
//
const getPlacement = (
  { x: x0, y: y0 }: { x: number; y: number },
  { x: x1, y: y1 }: { x: number; y: number },
) => {
  let fromAnchor;
  let toAnchor;

  toAnchor = x0 > x1 ? 'left' : 'right';
  fromAnchor = y0 > y1 ? 'top' : 'bottom';

  return { fromAnchor, toAnchor };
};

export function preventDefault(e: any) {
  e.preventDefault();
}

export function stopPropagation(e: any) {
  e.stopPropagation();
}

export const generateKey = (name: string) => {
  return `${name}-${new Date().getTime() % 1000000}`;
};

export const getRelativeLinesByBlockKey = (blockKey: string, mapping: any) => {
  let lineKeys = [];

  for (let key in mapping) {
    const value = mapping[key];
    const { fromKey, toKey } = value;

    if (blockKey == fromKey || blockKey == toKey) {
      lineKeys.push(key);
    }
  }
  lineKeys = Array.from(new Set(lineKeys));

  return lineKeys;
};

export const getLineCoordinates = (from: any, to: any, offset: any) => {
  // todo
  let firstLineVisible = true;
  let secondLineVisible = true;
  let thirdLineVisible = true;

  const { fromAnchor } = getPlacement(
    { x: from.x, y: from.y },
    { x: to.x, y: to.y },
  );
  const offsetX = window.pageXOffset - offset.x;
  const offsetY = window.pageYOffset - offset.y;

  const fromWidth = from.width || 0;
  const fromHeight = from.height || 0;
  const toWidth = to.width || 0;
  const toHeight = to.height || 0;
  const centerX = (from.x + to.x + fromWidth) / 2 + offsetX;

  let x0 = from.x + offsetX + fromWidth;
  let x1 = to.x + offsetX;
  let y0 = from.y + offsetY + fromHeight / 2;
  let y1 = to.y + offsetY + toHeight / 2;

  if (from.x >= to.x + toWidth) {
    x0 = x0 - fromWidth;
    x1 = x1 + fromWidth;
  }

  if (
    fromAnchor === 'bottom' &&
    // toAnchor === 'right' &&
    from.x + fromWidth / 2 >= to.x - toWidth / 2 &&
    from.x <= to.x
  ) {
    firstLineVisible = false;
    thirdLineVisible = false;
    y0 = y0 + fromHeight / 2;
    y1 = y1 - toHeight / 2;
  }

  if (
    fromAnchor === 'bottom' &&
    // toAnchor === 'left' &&
    from.x >= to.x &&
    from.x < to.x + toWidth
  ) {
    firstLineVisible = false;
    thirdLineVisible = false;
    y0 = y0 + fromHeight / 2;
    y1 = y1 - toHeight / 2;
  }

  if (
    fromAnchor === 'top' &&
    // toAnchor === 'right' &&
    from.x + fromWidth / 2 >= to.x - toWidth / 2 &&
    from.x <= to.x
  ) {
    firstLineVisible = false;
    thirdLineVisible = false;
    y0 = y0 - toHeight / 2;
    y1 = y1 + fromHeight / 2;
  }

  if (
    fromAnchor === 'top' &&
    // toAnchor === 'left' &&
    from.x >= to.x &&
    from.x < to.x + toWidth
  ) {
    firstLineVisible = false;
    thirdLineVisible = false;
    y0 = y0 - toHeight / 2;
    y1 = y1 + fromHeight / 2;
  }
  return {
    x0,
    x1,
    y0,
    y1,
    centerX,
    firstLineVisible,
    secondLineVisible,
    thirdLineVisible,
  };
};
