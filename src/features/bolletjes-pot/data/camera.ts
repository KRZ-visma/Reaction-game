function readField(error: unknown, field: 'name' | 'message'): string {
  if (typeof error === 'object' && error !== null && field in error) {
    const value = (error as Record<string, unknown>)[field];
    if (typeof value === 'string') {
      return value;
    }
  }
  return '';
}

export function cameraFailureMessage(error: unknown): string {
  const name = readField(error, 'name');
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera-toegang geweigerd. Sta de camera toe en probeer opnieuw.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Geen camera gevonden. Sluit een camera aan en probeer opnieuw.';
  }
  const message = readField(error, 'message');
  if (name === 'Error' && message) {
    return message;
  }
  return 'Camera of detectie kon niet starten.';
}

export type CameraSession = {
  stream: MediaStream;
  video: HTMLVideoElement;
  stop: () => void;
};

export async function startCamera(
  video: HTMLVideoElement = document.createElement('video'),
): Promise<CameraSession> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera wordt niet ondersteund in deze browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.srcObject = stream;
  await video.play();

  return {
    stream,
    video,
    stop: () => {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      video.srcObject = null;
    },
  };
}
