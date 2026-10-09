import { collectDotsAtPoints, spawnDots, type Dot, type Point } from './dots';
import {
  type GamePhase,
  type RoundDurationSeconds,
  isRoundDuration,
} from './phases';

export type GameState = {
  phase: GamePhase;
  durationSeconds: RoundDurationSeconds;
  remainingSeconds: number;
  countdownValue: number | null;
  score: number;
  dots: Dot[];
  statusMessage: string;
};

export type GameEvent =
  | { type: 'selectDuration'; seconds: RoundDurationSeconds }
  | { type: 'start' }
  | { type: 'cameraReady' }
  | { type: 'cameraError'; message: string }
  | { type: 'personDetected' }
  | { type: 'countdownTick' }
  | { type: 'tick'; deltaSeconds: number }
  | { type: 'hands'; points: Point[] }
  | { type: 'reset' };

const MAX_DOTS = 7;
const SPAWN_EVERY_SECONDS = 0.85;
const INITIAL_DOTS = 4;

export function createInitialState(
  durationSeconds: RoundDurationSeconds = 60,
): GameState {
  return {
    phase: 'setup',
    durationSeconds,
    remainingSeconds: durationSeconds,
    countdownValue: null,
    score: 0,
    dots: [],
    statusMessage: 'Kies een speelduur en start.',
  };
}

function createIdFactory(start = 1): () => number {
  let current = start;
  return () => {
    const id = current;
    current += 1;
    return id;
  };
}

export type GameEngine = {
  getState: () => GameState;
  dispatch: (event: GameEvent) => GameState;
};

export function createGameEngine(
  initialDuration: RoundDurationSeconds = 60,
  random: () => number = Math.random,
): GameEngine {
  let state = createInitialState(initialDuration);
  let nextId = createIdFactory();
  let spawnAccumulator = 0;

  const setState = (patch: Partial<GameState>): GameState => {
    state = { ...state, ...patch };
    return state;
  };

  const resetRoundFields = (durationSeconds: RoundDurationSeconds): Partial<GameState> => ({
    durationSeconds,
    remainingSeconds: durationSeconds,
    countdownValue: null,
    score: 0,
    dots: [],
  });

  const beginPlaying = (): GameState => {
    nextId = createIdFactory();
    spawnAccumulator = 0;
    const dots = spawnDots({
      count: INITIAL_DOTS,
      existing: [],
      random,
      nextId,
    });
    return setState({
      phase: 'playing',
      countdownValue: null,
      remainingSeconds: state.durationSeconds,
      score: 0,
      dots,
      statusMessage: 'Pak de bolletjes met je handen!',
    });
  };

  const dispatch = (event: GameEvent): GameState => {
    switch (event.type) {
      case 'selectDuration': {
        if (state.phase !== 'setup' || !isRoundDuration(event.seconds)) {
          return state;
        }
        return setState({
          ...resetRoundFields(event.seconds),
          statusMessage: 'Kies een speelduur en start.',
        });
      }
      case 'start': {
        if (state.phase !== 'setup') {
          return state;
        }
        return setState({
          phase: 'camera',
          ...resetRoundFields(state.durationSeconds),
          statusMessage: 'Camera starten…',
        });
      }
      case 'cameraReady': {
        if (state.phase !== 'camera') {
          return state;
        }
        return setState({
          phase: 'detecting',
          statusMessage: 'Ga voor de camera…',
        });
      }
      case 'cameraError': {
        if (state.phase !== 'camera' && state.phase !== 'detecting') {
          return state;
        }
        return setState({
          phase: 'setup',
          ...resetRoundFields(state.durationSeconds),
          statusMessage: event.message,
        });
      }
      case 'personDetected': {
        if (state.phase !== 'detecting') {
          return state;
        }
        return setState({
          phase: 'countdown',
          countdownValue: 3,
          statusMessage: 'Maak je klaar…',
        });
      }
      case 'countdownTick': {
        if (state.phase !== 'countdown' || state.countdownValue === null) {
          return state;
        }
        if (state.countdownValue <= 1) {
          return beginPlaying();
        }
        return setState({
          countdownValue: state.countdownValue - 1,
        });
      }
      case 'tick': {
        if (state.phase !== 'playing') {
          return state;
        }
        const remainingSeconds = Math.max(0, state.remainingSeconds - event.deltaSeconds);
        spawnAccumulator += event.deltaSeconds;

        let dots = state.dots;
        while (spawnAccumulator >= SPAWN_EVERY_SECONDS && dots.length < MAX_DOTS) {
          spawnAccumulator -= SPAWN_EVERY_SECONDS;
          const needed = Math.min(2, MAX_DOTS - dots.length);
          dots = [
            ...dots,
            ...spawnDots({
              count: needed,
              existing: dots,
              random,
              nextId,
            }),
          ];
        }

        if (remainingSeconds <= 0) {
          return setState({
            phase: 'finished',
            remainingSeconds: 0,
            dots: [],
            statusMessage: `Klaar! Score: ${state.score}`,
          });
        }

        return setState({ remainingSeconds, dots });
      }
      case 'hands': {
        if (state.phase !== 'playing' || event.points.length === 0) {
          return state;
        }
        const { remaining, collectedIds } = collectDotsAtPoints(state.dots, event.points);
        if (collectedIds.length === 0) {
          return state;
        }
        return setState({
          dots: remaining,
          score: state.score + collectedIds.length,
        });
      }
      case 'reset': {
        nextId = createIdFactory();
        spawnAccumulator = 0;
        return setState({
          phase: 'setup',
          ...resetRoundFields(state.durationSeconds),
          statusMessage: 'Kies een speelduur en start.',
        });
      }
      default: {
        return state;
      }
    }
  };

  return {
    getState: () => state,
    dispatch,
  };
}
