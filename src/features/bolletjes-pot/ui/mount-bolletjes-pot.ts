import { cameraFailureMessage, startCamera, type CameraSession } from '../data/camera';
import { createHandDetector, type HandDetector } from '../data/hand-detector';
import { createGameEngine, type GameState } from '../model/game';
import {
  ROUND_DURATIONS,
  formatClock,
  formatDurationLabel,
  type RoundDurationSeconds,
} from '../model/phases';
import { paintCatchers } from './render-catcher';
import { drawDots, syncCanvasSize } from './render-dots';
import './bolletjes-pot.css';

type Runtime = {
  camera: CameraSession | null;
  detector: HandDetector | null;
  rafId: number | null;
  countdownTimer: number | null;
  lastFrameMs: number | null;
};

export function mountBolletjesPot(host: HTMLElement): { destroy: () => void } {
  const engine = createGameEngine();
  const runtime: Runtime = {
    camera: null,
    detector: null,
    rafId: null,
    countdownTimer: null,
    lastFrameMs: null,
  };

  const root = document.createElement('section');
  root.className = 'pot';
  root.innerHTML = `
    <div class="pot__stage" aria-hidden="true">
      <video class="pot__video" playsinline muted></video>
      <canvas class="pot__canvas"></canvas>
    </div>
    <div class="pot__hud">
      <div class="pot__top">
        <p class="pot__stat pot__score">Score 0</p>
        <p class="pot__stat pot__time">1:00</p>
      </div>
      <div class="pot__center">
        <p class="pot__brand">Reaction-game</p>
        <p class="pot__lead">Elke hand wordt een rondje. Vang daarmee de bolletjes.</p>
        <p class="pot__status" role="status" aria-live="polite"></p>
        <p class="pot__countdown" hidden aria-live="assertive"></p>
        <div class="pot__scoreboard" hidden>
          <h2>Pot voorbij</h2>
          <p class="pot__final-score">0</p>
          <button type="button" class="pot__primary pot__again">Opnieuw</button>
        </div>
      </div>
      <div class="pot__controls">
        <div class="pot__durations" role="group" aria-label="Speelduur">
          ${ROUND_DURATIONS.map(
            (seconds) => `
              <button
                type="button"
                class="pot__duration"
                data-duration="${seconds}"
                aria-pressed="${seconds === 60 ? 'true' : 'false'}"
              >${formatDurationLabel(seconds)}</button>
            `,
          ).join('')}
        </div>
        <button type="button" class="pot__primary pot__start">Start</button>
        <button type="button" class="pot__ghost pot__stop" hidden>Stop</button>
      </div>
    </div>
  `;

  host.append(root);

  const video = root.querySelector('.pot__video') as HTMLVideoElement;
  const canvas = root.querySelector('.pot__canvas') as HTMLCanvasElement;
  const scoreEl = root.querySelector('.pot__score') as HTMLElement;
  const timeEl = root.querySelector('.pot__time') as HTMLElement;
  const statusEl = root.querySelector('.pot__status') as HTMLElement;
  const leadEl = root.querySelector('.pot__lead') as HTMLElement;
  const brandEl = root.querySelector('.pot__brand') as HTMLElement;
  const countdownEl = root.querySelector('.pot__countdown') as HTMLElement;
  const scoreboardEl = root.querySelector('.pot__scoreboard') as HTMLElement;
  const finalScoreEl = root.querySelector('.pot__final-score') as HTMLElement;
  const controlsEl = root.querySelector('.pot__controls') as HTMLElement;
  const startBtn = root.querySelector('.pot__start') as HTMLButtonElement;
  const stopBtn = root.querySelector('.pot__stop') as HTMLButtonElement;
  const againBtn = root.querySelector('.pot__again') as HTMLButtonElement;
  const durationButtons = [
    ...root.querySelectorAll<HTMLButtonElement>('.pot__duration'),
  ];

  const clearCountdownTimer = (): void => {
    if (runtime.countdownTimer !== null) {
      window.clearInterval(runtime.countdownTimer);
      runtime.countdownTimer = null;
    }
  };

  const stopLoop = (): void => {
    if (runtime.rafId !== null) {
      cancelAnimationFrame(runtime.rafId);
      runtime.rafId = null;
    }
    runtime.lastFrameMs = null;
  };

  const teardownMedia = (): void => {
    stopLoop();
    clearCountdownTimer();
    runtime.camera?.stop();
    runtime.camera = null;
    runtime.detector?.close();
    runtime.detector = null;
  };

  const render = (state: GameState): void => {
    scoreEl.textContent = `Score ${state.score}`;
    timeEl.textContent = formatClock(state.remainingSeconds);
    statusEl.textContent = state.statusMessage;
    finalScoreEl.textContent = String(state.score);

    const inSetup = state.phase === 'setup';
    const inLive =
      state.phase === 'camera' ||
      state.phase === 'detecting' ||
      state.phase === 'countdown' ||
      state.phase === 'playing';
    const finished = state.phase === 'finished';

    brandEl.hidden = !(inSetup || state.phase === 'camera' || state.phase === 'detecting');
    leadEl.hidden = !inSetup;
    controlsEl.hidden = !inSetup;
    stopBtn.hidden = !inLive;
    scoreboardEl.hidden = !finished;
    countdownEl.hidden = state.phase !== 'countdown';
    countdownEl.textContent =
      state.countdownValue === null ? '' : String(state.countdownValue);

    for (const button of durationButtons) {
      const value = Number(button.dataset.duration) as RoundDurationSeconds;
      button.setAttribute(
        'aria-pressed',
        value === state.durationSeconds ? 'true' : 'false',
      );
    }

    if (state.phase !== 'playing' && state.phase !== 'countdown') {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startCountdown = (): void => {
    clearCountdownTimer();
    runtime.countdownTimer = window.setInterval(() => {
      const state = engine.dispatch({ type: 'countdownTick' });
      render(state);
      if (state.phase !== 'countdown') {
        clearCountdownTimer();
      }
    }, 1000);
  };

  const frame = (nowMs: number): void => {
    const state = engine.getState();
    if (
      state.phase !== 'detecting' &&
      state.phase !== 'countdown' &&
      state.phase !== 'playing'
    ) {
      runtime.rafId = null;
      return;
    }

    if (runtime.camera && runtime.detector && video.readyState >= 2) {
      syncCanvasSize(canvas, video.videoWidth || canvas.clientWidth, video.videoHeight || canvas.clientHeight);
      const sample = runtime.detector.detect(video, nowMs);

      if (state.phase === 'detecting' && sample.handsPresent) {
        const next = engine.dispatch({ type: 'handsDetected' });
        render(next);
        startCountdown();
      }

      const phase = engine.getState().phase;
      if (phase === 'playing') {
        if (runtime.lastFrameMs !== null) {
          const deltaSeconds = Math.min(0.1, (nowMs - runtime.lastFrameMs) / 1000);
          engine.dispatch({ type: 'tick', deltaSeconds });
        }
        runtime.lastFrameMs = nowMs;
      } else {
        runtime.lastFrameMs = nowMs;
      }

      const live = engine.getState();
      if (live.phase === 'countdown' || live.phase === 'playing') {
        engine.dispatch({
          type: 'hands',
          hands: sample.hands,
          frame: { width: canvas.width, height: canvas.height },
        });
      }

      const painted = engine.getState();
      if (painted.phase === 'countdown' || painted.phase === 'playing') {
        drawDots(canvas, painted.phase === 'playing' ? painted.dots : [], nowMs);
        paintCatchers(canvas, painted.catchers, {
          width: canvas.width,
          height: canvas.height,
        });
      }
      render(painted);
      if (painted.phase === 'finished') {
        teardownMedia();
        runtime.rafId = null;
        return;
      }
    }

    runtime.rafId = requestAnimationFrame(frame);
  };

  const ensureLoop = (): void => {
    if (runtime.rafId === null) {
      runtime.rafId = requestAnimationFrame(frame);
    }
  };

  const beginSession = async (): Promise<void> => {
    render(engine.dispatch({ type: 'start' }));
    try {
      runtime.camera = await startCamera(video);
      runtime.detector = await createHandDetector();
      render(engine.dispatch({ type: 'cameraReady' }));
      ensureLoop();
    } catch (error) {
      teardownMedia();
      render(
        engine.dispatch({
          type: 'cameraError',
          message: cameraFailureMessage(error),
        }),
      );
    }
  };

  startBtn.addEventListener('click', () => {
    void beginSession();
  });

  stopBtn.addEventListener('click', () => {
    teardownMedia();
    render(engine.dispatch({ type: 'reset' }));
  });

  againBtn.addEventListener('click', () => {
    teardownMedia();
    render(engine.dispatch({ type: 'reset' }));
  });

  for (const button of durationButtons) {
    button.addEventListener('click', () => {
      const seconds = Number(button.dataset.duration);
      if (seconds === 60 || seconds === 120) {
        render(engine.dispatch({ type: 'selectDuration', seconds }));
      }
    });
  }

  render(engine.getState());

  return {
    destroy() {
      teardownMedia();
      root.remove();
    },
  };
}
