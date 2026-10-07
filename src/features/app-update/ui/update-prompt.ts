export type UpdatePromptHandles = {
  root: HTMLElement;
  show: () => void;
  hide: () => void;
};

export function createUpdatePrompt(onRefresh: () => void): UpdatePromptHandles {
  const root = document.createElement('div');
  root.className = 'update-prompt';
  root.hidden = true;
  root.innerHTML = `
    <div class="update-prompt__panel" role="status" aria-live="polite">
      <p class="update-prompt__title">Nieuwe versie beschikbaar</p>
      <p class="update-prompt__body">Er is een update. Tik op Vernieuwen om te laden.</p>
      <div class="update-prompt__actions">
        <button type="button" class="update-prompt__refresh">Vernieuwen</button>
        <button type="button" class="update-prompt__later">Later</button>
      </div>
    </div>
  `;

  const refresh = root.querySelector('.update-prompt__refresh');
  const later = root.querySelector('.update-prompt__later');
  refresh?.addEventListener('click', () => onRefresh());
  later?.addEventListener('click', () => {
    root.hidden = true;
  });

  return {
    root,
    show: () => {
      root.hidden = false;
    },
    hide: () => {
      root.hidden = true;
    },
  };
}
