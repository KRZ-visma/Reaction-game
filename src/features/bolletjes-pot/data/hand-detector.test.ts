import { describe, expect, it } from 'vitest';
import { handsFromDetection } from './hand-detector';

function landmarksAt(x: number, y: number): { x: number; y: number }[] {
  return Array.from({ length: 21 }, () => ({ x, y }));
}

describe('handsFromDetection', () => {
  it('keeps the camera x so the catcher follows the mirrored preview', () => {
    const hands = handsFromDetection(
      [landmarksAt(0.2, 0.4), landmarksAt(0.75, 0.6)],
      [[{ categoryName: 'Left' }], [{ categoryName: 'Right' }]],
    );

    expect(hands).toEqual([
      { side: 'left', x: 0.2, y: 0.4 },
      { side: 'right', x: 0.75, y: 0.6 },
    ]);
  });

  it('ignores a hand without palm landmarks', () => {
    const hands = handsFromDetection([[]], [[{ categoryName: 'Left' }]]);
    expect(hands).toEqual([]);
  });
});
