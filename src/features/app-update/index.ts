import { registerSW } from 'virtual:pwa-register';
import { getAppVersion } from './model/version';
import { createUpdatePrompt } from './ui/update-prompt';
import './ui/update-prompt.css';

export { getAppVersion };

export function mountAppUpdate(host: HTMLElement): { versionLabel: HTMLElement } {
  const versionLabel = document.createElement('p');
  versionLabel.className = 'app-version';
  versionLabel.textContent = `v${getAppVersion()}`;

  const prompt = createUpdatePrompt(() => {
    void updateSW(true);
  });

  host.append(versionLabel, prompt.root);

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      prompt.show();
    },
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void navigator.serviceWorker?.getRegistration().then((reg) => reg?.update());
    }
  });

  return { versionLabel };
}
