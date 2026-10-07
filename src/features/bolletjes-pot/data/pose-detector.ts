import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { Point } from '../model/dots';

export type PoseSample = {
  personPresent: boolean;
  handPoints: Point[];
};

export type PoseDetector = {
  detect: (video: HTMLVideoElement, timestampMs: number) => PoseSample;
  close: () => void;
};

const HAND_LANDMARK_INDEXES = [15, 16, 17, 18, 19, 20, 21, 22] as const;

function toPoints(result: PoseLandmarkerResult): Point[] {
  const pose = result.landmarks[0];
  if (!pose) {
    return [];
  }

  const points: Point[] = [];
  for (const index of HAND_LANDMARK_INDEXES) {
    const landmark = pose[index];
    if (!landmark || (landmark.visibility ?? 1) < 0.35) {
      continue;
    }
    // Selfie camera is mirrored in CSS; x is flipped to match on-screen dots.
    points.push({
      x: 1 - landmark.x,
      y: landmark.y,
    });
  }
  return points;
}

async function createLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: 'GPU' | 'CPU',
): Promise<PoseLandmarker> {
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate,
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
}

export async function createPoseDetector(): Promise<PoseDetector> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
  );

  let landmarker: PoseLandmarker;
  try {
    landmarker = await createLandmarker(vision, 'GPU');
  } catch {
    landmarker = await createLandmarker(vision, 'CPU');
  }

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs);
      const handPoints = toPoints(result);
      return {
        personPresent: result.landmarks.length > 0,
        handPoints,
      };
    },
    close() {
      landmarker.close();
    },
  };
}
