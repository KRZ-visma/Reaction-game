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
export const CATCHER_CIRCLE_RADIUS = 0.045;

export type Catcher = {
  side: HandSide;
  /** Palm center, normalized 0–1. The circle is centered here. */
  x: number;
  y: number;
  circleRadius: number;
};

export type CatcherLayout = {
  circleX: number;
  circleY: number;
  circleRadius: number;
};

export function catcherFromHand(hand: DetectedHand): Catcher {
  return {
    side: hand.side,
    x: hand.x,
    y: hand.y,
    circleRadius: CATCHER_CIRCLE_RADIUS,
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
  return {
    circleX: catcher.x * width,
    circleY: catcher.y * height,
    circleRadius: catcher.circleRadius * minDim,
  };
}

export function catcherHitsDot(catcher: Catcher, dot: Dot, frame: FrameSize): boolean {
  const { width, height } = resolveFrame(frame);
  const layout = layoutCatcher(catcher, frame);
  const minDim = Math.min(width, height);
  const dx = dot.x * width - layout.circleX;
  const dy = dot.y * height - layout.circleY;
  const reach = layout.circleRadius + dot.radius * minDim;
  return Math.hypot(dx, dy) <= reach;
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
