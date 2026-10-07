import { mountAppUpdate } from '../features/app-update';
import { mountBolletjesPot } from '../features/bolletjes-pot';

export function mountApp(root: HTMLElement): void {
  root.replaceChildren();
  const gameHost = document.createElement('div');
  gameHost.className = 'app-shell';
  gameHost.style.height = '100%';
  root.append(gameHost);

  mountBolletjesPot(gameHost);
  mountAppUpdate(root);
}
