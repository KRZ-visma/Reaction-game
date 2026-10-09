import type { Dot } from './dots';

export type HandSide = 'left' | 'right';

export type DetectedHand = {
  side: HandSide;
  x: number;
  y: number;
};

export type FrameSize = {
  width: number;
  height: number;
};

/** Circle radius as a fraction of the shorter frame side. */
export const CATCHER_CIRCLE_RADIUS = 0.06;

/** Square edge as a fraction of the shorter frame side. */
export const CATCHER_SQUARE_SIZE = 0.14;

/** Fraction of the circle radius that sinks into the top of the square. */
export const CATCHER_SINK = 0.42;

export type Catcher = {
  side: HandSide;
  /** Palm anchor. The square is centered here; the circle sits on top. */
  x: number;
  y: number;
  circleRadius: number;
  squareSize: number;
};

export type CatcherLayout = {
  circleX: number;
  circleY: number;
  circleRadius: number;
  squareLeft: number;
  squareTop: number;
  squareSize: number;
};

export function catcherFromHand(hand: DetectedHand): Catcher {
  return {
    side: hand.side,
    x: hand.x,
    y: hand.y,
    circleRadius: CATCHER_CIRCLE_RADIUS,
    squareSize: CATCHER_SQUARE_SIZE,
  };
}

function resolveFrame(frame: FrameSize): { width: number; height: number } {
  return {
    width: frame.width > 0 ? frame.width : 1,
    height: frame.height > 0 ? frame.height : 1,
  };
}

export function layoutCatcher(catcher: Catcher, frame: FrameSize): CatcherLayout {
  const { width, height } = resolveFrame(frame);
  const minDim = Math.min(width, height);
  const squareSize = catcher.squareSize * minDim;
  const circleRadius = catcher.circleRadius * minDim;
  const anchorX = catcher.x * width;
  const anchorY = catcher.y * height;
  const squareLeft = anchorX - squareSize / 2;
  const squareTop = anchorY - squareSize / 2;
  const circleY = squareTop - circleRadius + circleRadius * CATCHER_SINK;

  return {
    circleX: anchorX,
    circleY,
    circleRadius,
    squareLeft,
    squareTop,
    squareSize,
  };
}

function circleHitsCircle(
  ax: number,
  ay: number,
  aRadius: number,
  bx: number,
  by: number,
  bRadius: number,
): boolean {
  return Math.hypot(ax - bx, ay - by) <= aRadius + bRadius;
}

function circleHitsSquare(
  centerX: number,
  centerY: number,
  radius: number,
  left: number,
  top: number,
  size: number,
): boolean {
  const nearestX = Math.min(Math.max(centerX, left), left + size);
  const nearestY = Math.min(Math.max(centerY, top), top + size);
  return Math.hypot(centerX - nearestX, centerY - nearestY) <= radius;
}

export function catcherHitsDot(catcher: Catcher, dot: Dot, frame: FrameSize): boolean {
  const { width, height } = resolveFrame(frame);
  const layout = layoutCatcher(catcher, frame);
  const minDim = Math.min(width, height);
  const dotX = dot.x * width;
  const dotY = dot.y * height;
  const dotRadius = dot.radius * minDim;

  if (
    circleHitsCircle(
      layout.circleX,
      layout.circleY,
      layout.circleRadius,
      dotX,
      dotY,
      dotRadius,
    )
  ) {
    return true;
  }

  return circleHitsSquare(
    dotX,
    dotY,
    dotRadius,
    layout.squareLeft,
    layout.squareTop,
    layout.squareSize,
  );
}

export function collectDotsWithCatchers(
  dots: readonly Dot[],
  catchers: readonly Catcher[],
  frame: FrameSize,
): { remaining: Dot[]; collectedIds: number[] } {
  const collectedIds: number[] = [];
  const remaining: Dot[] = [];

  for (const dot of dots) {
    const hit = catchers.some((catcher) => catcherHitsDot(catcher, dot, frame));
    if (hit) {
      collectedIds.push(dot.id);
    } else {
      remaining.push(dot);
    }
  }

  return { remaining, collectedIds };
}
