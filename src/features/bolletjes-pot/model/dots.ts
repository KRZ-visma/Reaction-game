export type Dot = {
  id: number;
  x: number;
  y: number;
  radius: number;
};

export type Point = {
  x: number;
  y: number;
};

export type SpawnDotsOptions = {
  count: number;
  existing: readonly Dot[];
  radius?: number;
  maxAttempts?: number;
  minDistance?: number;
  random?: () => number;
  nextId: () => number;
};

const DEFAULT_RADIUS = 0.055;
const DEFAULT_MIN_DISTANCE = 0.14;
const EDGE_PADDING = 0.08;

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function overlapsExisting(
  candidate: Point,
  existing: readonly Dot[],
  minDistance: number,
): boolean {
  return existing.some((dot) => distance(candidate, dot) < minDistance);
}

export function createDot(
  id: number,
  x: number,
  y: number,
  radius = DEFAULT_RADIUS,
): Dot {
  return { id, x, y, radius };
}

export function spawnDots(options: SpawnDotsOptions): Dot[] {
  const {
    count,
    existing,
    radius = DEFAULT_RADIUS,
    maxAttempts = 40,
    minDistance = DEFAULT_MIN_DISTANCE,
    random = Math.random,
    nextId,
  } = options;

  const spawned: Dot[] = [];
  const known = [...existing];

  for (let i = 0; i < count; i += 1) {
    let placed: Dot | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const x = EDGE_PADDING + random() * (1 - EDGE_PADDING * 2);
      const y = EDGE_PADDING + random() * (1 - EDGE_PADDING * 2);
      if (overlapsExisting({ x, y }, [...known, ...spawned], minDistance)) {
        continue;
      }
      placed = createDot(nextId(), x, y, radius);
      break;
    }
    if (placed) {
      spawned.push(placed);
    }
  }

  return spawned;
}

export function collectDotsAtPoints(
  dots: readonly Dot[],
  points: readonly Point[],
): { remaining: Dot[]; collectedIds: number[] } {
  const collectedIds: number[] = [];
  const remaining: Dot[] = [];

  for (const dot of dots) {
    const hit = points.some((point) => distance(point, dot) <= dot.radius * 1.35);
    if (hit) {
      collectedIds.push(dot.id);
    } else {
      remaining.push(dot);
    }
  }

  return { remaining, collectedIds };
}
