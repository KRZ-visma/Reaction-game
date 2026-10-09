import { describe, expect, it } from 'vitest';
import { handsFromDetection } from './hand-detector';

function landmarksAt(x: number, y: number): { x: number; y: number }[] {
  return Array.from({ length: 21 }, () => ({ x, y }));
}

describe('handsFromDetection', () => {
  it('mirrors the palm and keeps left and right hands', () => {
    const hands = handsFromDetection(
      [landmarksAt(0.2, 0.4), landmarksAt(0.75, 0.6)],
      [[{ categoryName: 'Left' }], [{ categoryName: 'Right' }]],
    );

    expect(hands).toEqual([
      { side: 'left', x: 0.8, y: 0.4 },
      { side: 'right', x: 0.25, y: 0.6 },
    ]);
  });

  it('ignores a hand without palm landmarks', () => {
    const hands = handsFromDetection([[]], [[{ categoryName: 'Left' }]]);
    expect(hands).toEqual([]);
  });
});
