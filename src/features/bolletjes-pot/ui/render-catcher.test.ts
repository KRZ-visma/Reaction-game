import { describe, expect, it } from 'vitest';
import { CATCHER_CIRCLE_RADIUS, catcherFromHand } from '../model/catcher';
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
  it('draws only a circle centered on the hand', () => {
    const { ctx, calls } = fakeContext();
    drawCatchers(ctx, [catcherFromHand({ side: 'left', x: 0.5, y: 0.4 })], {
      width: 1000,
      height: 1000,
    });

    expect(calls.some((call) => call.op === 'rect')).toBe(false);
    const arc = calls.find((call) => call.op === 'arc');
    expect(arc?.args[0]).toBeCloseTo(500);
    expect(arc?.args[1]).toBeCloseTo(400);
    expect(arc?.args[2]).toBeCloseTo(CATCHER_CIRCLE_RADIUS * 1000);
  });
});
