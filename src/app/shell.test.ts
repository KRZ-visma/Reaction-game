import { describe, expect, it } from 'vitest';

describe('scaffold smoke', () => {
  it('boots the document shell contract', () => {
    document.body.innerHTML = '<div id="app"></div>';
    expect(document.querySelector('#app')).not.toBeNull();
  });
});
