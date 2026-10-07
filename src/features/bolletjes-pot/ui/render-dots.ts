import type { Dot } from '../model/dots';

export function drawDots(
  canvas: HTMLCanvasElement,
  dots: readonly Dot[],
  nowMs: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  for (const dot of dots) {
    const x = dot.x * width;
    const y = dot.y * height;
    const radius = dot.radius * Math.min(width, height);
    const pulse = 1 + Math.sin(nowMs / 180 + dot.id) * 0.08;

    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius * pulse);
    gradient.addColorStop(0, '#ffe39a');
    gradient.addColorStop(0.45, '#ff6b4a');
    gradient.addColorStop(1, 'rgb(255 107 74 / 0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff6d8';
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function syncCanvasSize(canvas: HTMLCanvasElement, width: number, height: number): void {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}
