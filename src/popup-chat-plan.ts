// First-visit popup for Avital explaining the chat plan.
// Shows once per browser (localStorage flag), dismissible via X / "Got it" / backdrop click / ESC.
// Built 2026-05-16 in response to Avital asking for live chat — real chat ships tomorrow.

const STORAGE_KEY = 'austria-chat-popup-seen-v1';

function buildBackdrop(): HTMLDivElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'popup-chat-plan-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'popup-chat-plan-title');
  backdrop.innerHTML = `
    <div class="popup-chat-plan">
      <button
        type="button"
        class="popup-chat-plan-close"
        aria-label="Close popup"
        data-action="close"
      >×</button>
      <h3 id="popup-chat-plan-title">Hey Avital 👋</h3>
      <ul class="popup-chat-plan-list">
        <li>Saw your note about live chat — building it now.</li>
        <li><strong>Tomorrow:</strong> real chat sidebar (type, get instant answers about the trip).</li>
        <li><strong>Tonight:</strong> leave notes via 💬 — Claude reads + works on them within 30 seconds.</li>
        <li>Status updates show on the Notes page when Claude has read + applied.</li>
        <li>Trip site keeps getting better while you sleep — refresh anytime.</li>
      </ul>
      <div class="popup-chat-plan-actions">
        <button type="button" class="btn primary" data-action="close">Got it</button>
      </div>
    </div>
  `;
  return backdrop;
}

function close(backdrop: HTMLDivElement): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Ignore — storage unavailable (private mode, etc.). Popup just won't be sticky.
  }
  backdrop.classList.remove('open');
  // Allow CSS fade before removing.
  setTimeout(() => {
    backdrop.remove();
    document.removeEventListener('keydown', escHandler);
  }, 200);
}

let escHandler: (e: KeyboardEvent) => void = () => {};

export function initChatPlanPopup(): void {
  // Skip if already seen.
  try {
    if (localStorage.getItem(STORAGE_KEY)) {
      return;
    }
  } catch {
    // If storage throws, still show once per page-load.
  }

  // Avoid double-mount if some page imports/inits twice.
  if (document.querySelector('.popup-chat-plan-backdrop')) {
    return;
  }

  const backdrop = buildBackdrop();
  document.body.appendChild(backdrop);

  // Open on next frame so the CSS transition kicks in.
  requestAnimationFrame(() => backdrop.classList.add('open'));

  // X button + Got it button.
  backdrop.querySelectorAll<HTMLButtonElement>('[data-action="close"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      close(backdrop);
    });
  });

  // Click outside (on backdrop itself, not children) closes.
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      close(backdrop);
    }
  });

  // ESC closes.
  escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close(backdrop);
    }
  };
  document.addEventListener('keydown', escHandler);
}
