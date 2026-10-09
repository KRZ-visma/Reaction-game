import { describe, expect, it } from 'vitest';
import { createGameEngine } from './game';
import { formatClock, formatDurationLabel } from './phases';

describe('bolletjes-pot game engine', () => {
  it('starts with setup and default one-minute duration', () => {
    const engine = createGameEngine();
    expect(engine.getState().phase).toBe('setup');
    expect(engine.getState().durationSeconds).toBe(60);
  });

  it('allows selecting one or two minutes in setup', () => {
    const engine = createGameEngine();
    engine.dispatch({ type: 'selectDuration', seconds: 120 });
    expect(engine.getState().durationSeconds).toBe(120);
    expect(formatDurationLabel(120)).toBe('2 minuten');
    expect(formatDurationLabel(60)).toBe('1 minuut');
  });

  it('runs camera → detect → countdown → play → finish', () => {
    const engine = createGameEngine(60, () => 0.5);
    engine.dispatch({ type: 'start' });
    expect(engine.getState().phase).toBe('camera');

    engine.dispatch({ type: 'cameraReady' });
    expect(engine.getState().phase).toBe('detecting');

    engine.dispatch({ type: 'handsDetected' });
    expect(engine.getState().phase).toBe('countdown');
    expect(engine.getState().countdownValue).toBe(3);

    engine.dispatch({ type: 'countdownTick' });
    engine.dispatch({ type: 'countdownTick' });
    engine.dispatch({ type: 'countdownTick' });
    expect(engine.getState().phase).toBe('playing');
    expect(engine.getState().dots.length).toBeGreaterThan(0);

    engine.dispatch({ type: 'tick', deltaSeconds: 60 });
    expect(engine.getState().phase).toBe('finished');
    expect(engine.getState().remainingSeconds).toBe(0);
  });

  it('collects dots when hands overlap and increases score', () => {
    const engine = createGameEngine(60, () => 0.5);
    engine.dispatch({ type: 'start' });
    engine.dispatch({ type: 'cameraReady' });
    engine.dispatch({ type: 'handsDetected' });
    engine.dispatch({ type: 'countdownTick' });
    engine.dispatch({ type: 'countdownTick' });
    engine.dispatch({ type: 'countdownTick' });

    const [dot] = engine.getState().dots;
    expect(dot).toBeDefined();
    engine.dispatch({
      type: 'hands',
      hands: [{ side: 'left', x: dot.x, y: dot.y }],
      frame: { width: 1000, height: 1000 },
    });
    expect(engine.getState().score).toBeGreaterThanOrEqual(1);
    expect(engine.getState().catchers).toHaveLength(1);
    expect(engine.getState().dots.some((item) => item.id === dot.id)).toBe(false);
  });

  it('shows catchers during countdown without scoring', () => {
    const engine = createGameEngine();
    engine.dispatch({ type: 'start' });
    engine.dispatch({ type: 'cameraReady' });
    engine.dispatch({ type: 'handsDetected' });
    engine.dispatch({
      type: 'hands',
      hands: [{ side: 'right', x: 0.3, y: 0.4 }],
      frame: { width: 800, height: 600 },
    });
    expect(engine.getState().phase).toBe('countdown');
    expect(engine.getState().catchers).toHaveLength(1);
    expect(engine.getState().score).toBe(0);
  });

  it('returns to setup on reset', () => {
    const engine = createGameEngine(120);
    engine.dispatch({ type: 'start' });
    engine.dispatch({ type: 'reset' });
    expect(engine.getState().phase).toBe('setup');
    expect(engine.getState().durationSeconds).toBe(120);
    expect(engine.getState().score).toBe(0);
  });

  it('formats the clock for the HUD', () => {
    expect(formatClock(125)).toBe('2:05');
    expect(formatClock(0.2)).toBe('0:01');
  });
});
