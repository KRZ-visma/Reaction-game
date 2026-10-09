import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { DetectedHand, HandSide } from '../model/catcher';

export type HandSample = {
  handsPresent: boolean;
  hands: DetectedHand[];
};

export type HandDetector = {
  detect: (video: HTMLVideoElement, timestampMs: number) => HandSample;
  close: () => void;
};

const PALM_LANDMARK_INDEXES = [0, 5, 9, 13, 17] as const;

const MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

type LandmarkPoint = { x: number; y: number };

export function handsFromDetection(
  landmarks: readonly (readonly LandmarkPoint[])[],
  handedness: readonly (readonly { categoryName?: string }[])[],
): DetectedHand[] {
  const hands: DetectedHand[] = [];

  for (let index = 0; index < landmarks.length; index += 1) {
    const points = landmarks[index];
    if (!points) {
      continue;
    }
    const center = palmCenter(points);
    if (!center) {
      continue;
    }
    hands.push({
      side: handSide(handedness[index]?.[0]?.categoryName),
      x: center.x,
      y: center.y,
    });
  }

  return hands;
}

function palmCenter(landmarks: readonly LandmarkPoint[]): { x: number; y: number } | null {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (const index of PALM_LANDMARK_INDEXES) {
    const landmark = landmarks[index];
    if (!landmark) {
      continue;
    }
    sumX += landmark.x;
    sumY += landmark.y;
    count += 1;
  }

  if (count === 0) {
    return null;
  }

  return {
    x: 1 - sumX / count,
    y: sumY / count,
  };
}

function handSide(label: string | undefined): HandSide {
  return label === 'Right' ? 'right' : 'left';
}

function toHands(result: HandLandmarkerResult): DetectedHand[] {
  return handsFromDetection(result.landmarks, result.handedness);
}

async function createLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: 'GPU' | 'CPU',
): Promise<HandLandmarker> {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 2,
  });
}

export async function createHandDetector(): Promise<HandDetector> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
  );

  let landmarker: HandLandmarker;
  try {
    landmarker = await createLandmarker(vision, 'GPU');
  } catch {
    landmarker = await createLandmarker(vision, 'CPU');
  }

  return {
    detect(video, timestampMs) {
      const hands = toHands(landmarker.detectForVideo(video, timestampMs));
      return {
        handsPresent: hands.length > 0,
        hands,
      };
    },
    close() {
      landmarker.close();
    },
  };
}
