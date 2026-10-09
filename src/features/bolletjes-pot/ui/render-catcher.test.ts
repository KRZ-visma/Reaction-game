import { describe, expect, it } from 'vitest';
import { catcherFromHand } from '../model/catcher';
import { drawCatchers } from './render-catcher';

type DrawCall = { op: 'rect' | 'arc'; args: number[] };

function fakeContext(): { ctx: CanvasRenderingContext2D; calls: DrawCall[] } {
  const calls: DrawCall[] = [];
  const ctx = {
    beginPath() {},
    fill() {},
    stroke() {},
    rect(...args: number[]) {
      calls.push({ op: 'rect', args });
    },
    arc(...args: number[]) {
      calls.push({ op: 'arc', args });
    },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe('drawCatchers', () => {
  it('draws the square first and the circle on top of it', () => {
    const { ctx, calls } = fakeContext();
    const catcher = catcherFromHand({ side: 'left', x: 0.5, y: 0.5 });
    drawCatchers(ctx, [catcher], { width: 1000, height: 1000 });

    const rect = calls.find((call) => call.op === 'rect');
    const arc = calls.find((call) => call.op === 'arc');
    expect(rect).toBeDefined();
    expect(arc).toBeDefined();
    expect(calls.findIndex((call) => call.op === 'rect')).toBeLessThan(
      calls.findIndex((call) => call.op === 'arc'),
    );

    const squareTop = rect?.args[1] ?? 0;
    const circleY = arc?.args[1] ?? 0;
    expect(circleY).toBeLessThan(squareTop);
  });
});
