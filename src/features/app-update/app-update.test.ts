import { describe, expect, it } from 'vitest';
import { getAppVersion } from './model/version';
import { createUpdatePrompt } from './ui/update-prompt';

describe('app-update', () => {
  it('exposes a non-empty app version', () => {
    expect(getAppVersion().length).toBeGreaterThan(0);
  });

  it('shows and hides the update prompt', () => {
    const prompt = createUpdatePrompt(() => undefined);
    expect(prompt.root.hidden).toBe(true);
    prompt.show();
    expect(prompt.root.hidden).toBe(false);
    prompt.hide();
    expect(prompt.root.hidden).toBe(true);
  });
});
