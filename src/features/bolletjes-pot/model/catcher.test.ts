import { describe, expect, it } from 'vitest';
import {
  CATCHER_CIRCLE_RADIUS,
  catcherFromHand,
  catcherHitsDot,
  collectDotsWithCatchers,
  layoutCatcher,
} from './catcher';
import type { Dot } from './dots';

const frame = { width: 1000, height: 1000 };

function dotAt(x: number, y: number, radius = 0.02): Dot {
  return { id: 1, x, y, radius };
}

describe('catcher', () => {
  it('places a smaller circle on the hand', () => {
    const catcher = catcherFromHand({ side: 'left', x: 0.5, y: 0.4 });
    const layout = layoutCatcher(catcher, frame);

    expect(layout.circleX).toBeCloseTo(500);
    expect(layout.circleY).toBeCloseTo(400);
    expect(layout.circleRadius).toBeCloseTo(CATCHER_CIRCLE_RADIUS * 1000);
    expect(CATCHER_CIRCLE_RADIUS).toBeLessThan(0.06);
  });

  it('collects a dot that overlaps the circle', () => {
    const catcher = catcherFromHand({ side: 'right', x: 0.5, y: 0.5 });
    const dot = dotAt(0.5, 0.5, 0.02);

    expect(catcherHitsDot(catcher, dot, frame)).toBe(true);
    const collected = collectDotsWithCatchers([dot], [catcher], frame);
    expect(collected.collectedIds).toEqual([1]);
  });

  it('leaves a dot outside the circle', () => {
    const catcher = catcherFromHand({ side: 'left', x: 0.5, y: 0.5 });
    const dot = dotAt(0.5, 0.62, 0.02);
    const collected = collectDotsWithCatchers([dot], [catcher], frame);

    expect(catcherHitsDot(catcher, dot, frame)).toBe(false);
    expect(collected.collectedIds).toEqual([]);
    expect(collected.remaining).toEqual([dot]);
  });
});
