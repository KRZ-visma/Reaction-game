import { describe, expect, it } from 'vitest';
import { spawnDots } from './dots';

describe('dots', () => {
  it('spawns the requested number of dots inside the frame', () => {
    let id = 0;
    const sequence = [0.1, 0.2, 0.4, 0.5, 0.7, 0.8];
    let cursor = 0;
    const dots = spawnDots({
      count: 3,
      existing: [],
      random: () => {
        const value = sequence[cursor % sequence.length] ?? 0.5;
        cursor += 1;
        return value;
      },
      nextId: () => {
        id += 1;
        return id;
      },
    });
    expect(dots).toHaveLength(3);
    for (const dot of dots) {
      expect(dot.x).toBeGreaterThan(0);
      expect(dot.x).toBeLessThan(1);
      expect(dot.y).toBeGreaterThan(0);
      expect(dot.y).toBeLessThan(1);
    }
  });
});
