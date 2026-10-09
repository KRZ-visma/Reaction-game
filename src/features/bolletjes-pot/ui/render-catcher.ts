import { layoutCatcher, type Catcher, type FrameSize } from '../model/catcher';

const CIRCLE_FILL = '#3dd6c6';
const CIRCLE_STROKE = '#f4fffc';
const CIRCLE_CORE = '#04201c';

export function drawCatchers(
  ctx: CanvasRenderingContext2D,
  catchers: readonly Catcher[],
  frame: FrameSize,
): void {
  const minDim = Math.min(
    frame.width > 0 ? frame.width : 1,
    frame.height > 0 ? frame.height : 1,
  );

  for (const catcher of catchers) {
    const layout = layoutCatcher(catcher, frame);
    ctx.lineWidth = Math.max(2, minDim * 0.005);

    ctx.beginPath();
    ctx.fillStyle = CIRCLE_FILL;
    ctx.strokeStyle = CIRCLE_STROKE;
    ctx.arc(layout.circleX, layout.circleY, layout.circleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = CIRCLE_CORE;
    ctx.arc(layout.circleX, layout.circleY, layout.circleRadius * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintCatchers(
  canvas: HTMLCanvasElement,
  catchers: readonly Catcher[],
  frame: FrameSize,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  drawCatchers(ctx, catchers, frame);
}
