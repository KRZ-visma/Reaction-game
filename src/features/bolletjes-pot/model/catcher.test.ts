import { describe, expect, it } from 'vitest';
import {
  CATCHER_SINK,
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
  it('places a circle on top of a square anchored at the hand', () => {
    const catcher = catcherFromHand({ side: 'left', x: 0.5, y: 0.5 });
    const layout = layoutCatcher(catcher, frame);
    const squareCenterY = layout.squareTop + layout.squareSize / 2;

    expect(layout.circleX).toBeCloseTo(500);
    expect(squareCenterY).toBeCloseTo(500);
    expect(layout.circleY).toBeLessThan(layout.squareTop);
    expect(layout.circleY + layout.circleRadius).toBeGreaterThan(layout.squareTop);
    expect(layout.circleY + layout.circleRadius - layout.squareTop).toBeCloseTo(
      layout.circleRadius * CATCHER_SINK,
    );
  });

  it('collects a dot that overlaps the circle', () => {
    const catcher = catcherFromHand({ side: 'right', x: 0.5, y: 0.5 });
    const layout = layoutCatcher(catcher, frame);
    const dot = dotAt(layout.circleX / 1000, layout.circleY / 1000, 0.02);

    expect(catcherHitsDot(catcher, dot, frame)).toBe(true);
  });

  it('collects a dot that overlaps only the square', () => {
    const catcher = catcherFromHand({ side: 'left', x: 0.5, y: 0.5 });
    const layout = layoutCatcher(catcher, frame);
    const squareCenterX = (layout.squareLeft + layout.squareSize / 2) / 1000;
    const squareCenterY = (layout.squareTop + layout.squareSize / 2) / 1000;
    const dot = dotAt(squareCenterX, squareCenterY, 0.01);

    expect(catcherHitsDot(catcher, dot, frame)).toBe(true);
    const collected = collectDotsWithCatchers([dot], [catcher], frame);
    expect(collected.collectedIds).toEqual([1]);
    expect(collected.remaining).toEqual([]);
  });

  it('leaves dots the catcher does not touch', () => {
    const catcher = catcherFromHand({ side: 'left', x: 0.8, y: 0.8 });
    const dot = dotAt(0.1, 0.1, 0.02);
    const collected = collectDotsWithCatchers([dot], [catcher], frame);

    expect(catcherHitsDot(catcher, dot, frame)).toBe(false);
    expect(collected.collectedIds).toEqual([]);
    expect(collected.remaining).toEqual([dot]);
  });
});
