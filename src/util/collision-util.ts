import { Vec2D } from '@/types/physics';

export function getCarCorners(
  position: Vec2D,
  width: number,
  height: number,
  angle: number
): Vec2D[] {
  const radianAngle = (angle * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const cosA = Math.cos(radianAngle);
  const sinA = Math.sin(radianAngle);

  //* Center the position of the car
  //* So here we have a problem with out center point of the car
  //* We need to add some offset to the position of the car
  //* That's why we have +30 and +15
  //* It's probably worth investigating why we need this offset
  const cx = position.x + halfHeight + 30;
  const cy = position.y + halfWidth + 15;
  return [
    {
      //* Front Left
      x: cx + (-halfWidth * cosA - -halfHeight * sinA),
      y: cy + (-halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Front Right
      x: cx + (halfWidth * cosA - -halfHeight * sinA),
      y: cy + (halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Rear Left
      x: cx + (-halfWidth * cosA - halfHeight * sinA),
      y: cy + (-halfWidth * sinA + halfHeight * cosA),
    },
    {
      //* Rear Right
      x: cx + (halfWidth * cosA - halfHeight * sinA),
      y: cy + (halfWidth * sinA + halfHeight * cosA),
    },
  ];
}

//* Important note !!!!!!
//* Corners are intersecting with, are not of player/opponent controller, but of obstacle
//* Also raycasting can be pretty taxing on the performance
//* So we need to use is sparingly
export function rayCast(
  from: Vec2D,
  to: Vec2D,
  corners: Vec2D[]
): Vec2D | null {
  let closestIntersection: Vec2D | null = null;
  let minDist = Infinity;

  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % corners.length];
    const intersection = getIntersection(from, to, p1, p2);

    if (intersection) {
      const dist = distance(from, intersection);
      if (dist < minDist) {
        minDist = dist;
        closestIntersection = intersection;
      }
    }
  }

  return closestIntersection;
}

function getIntersection(
  from: Vec2D,
  to: Vec2D,
  p1: Vec2D,
  p2: Vec2D
): Vec2D | null {
  const A1 = to.y - from.y;
  const B1 = from.x - to.x;
  const C1 = A1 * from.x + B1 * from.y;

  const A2 = p2.y - p1.y;
  const B2 = p1.x - p2.x;
  const C2 = A2 * p1.x + B2 * p1.y;

  const det = A1 * B2 - A2 * B1;
  if (det === 0) return null; //* Lines are parallel

  const ix = (B2 * C1 - B1 * C2) / det;
  const iy = (A1 * C2 - A2 * C1) / det;
  const intersection = { x: ix, y: iy };

  if (onSegment(from, intersection, to) && onSegment(p1, intersection, p2)) {
    return intersection;
  }

  return null;
}

function onSegment(p: Vec2D, q: Vec2D, r: Vec2D): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

function distance(a: Vec2D, b: Vec2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function lineSegmentToLineSegmentDistance(
  a1: Vec2D,
  a2: Vec2D,
  b1: Vec2D,
  b2: Vec2D
): number {
  const intersection = getIntersection(a1, a2, b1, b2);
  if (intersection) return 0; // Segments intersect

  const dist1 = Math.min(distance(a1, b1), distance(a1, b2));
  const dist2 = Math.min(distance(a2, b1), distance(a2, b2));
  const dist3 = Math.min(
    distanceToSegment(a1, b1, b2),
    distanceToSegment(a2, b1, b2)
  );
  const dist4 = Math.min(
    distanceToSegment(b1, a1, a2),
    distanceToSegment(b2, a1, a2)
  );

  return Math.min(dist1, dist2, dist3, dist4);
}

function distanceToSegment(p: Vec2D, v: Vec2D, w: Vec2D): number {
  const l2 = distance(v, w) ** 2;
  if (l2 === 0) return distance(p, v);

  const t = Math.max(
    0,
    Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2)
  );
  const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };

  return distance(p, projection);
}

export function lineToRectDistance(
  from: Vec2D,
  to: Vec2D,
  rect: Vec2D[]
): number {
  let minDist = Infinity;

  for (let i = 0; i < rect.length; i++) {
    const p1 = rect[i];
    const p2 = rect[(i + 1) % rect.length];
    const dist = lineSegmentToLineSegmentDistance(from, to, p1, p2);

    minDist = Math.min(minDist, dist);
  }

  return minDist;
}
