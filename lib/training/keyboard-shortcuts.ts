export const TRAINING_SHORTCUTS = {
  skip: {
    ariaKeyShortcuts: "S Escape",
    hints: ["S"],
  },
  timerToggle: {
    ariaKeyShortcuts: "T",
  },
  previousMove: {
    ariaKeyShortcuts: "ArrowLeft",
    hints: ["\u2190"],
  },
  nextMove: {
    ariaKeyShortcuts: "ArrowRight Space",
    hints: ["\u2192", "Space"],
  },
  nextPuzzle: {
    ariaKeyShortcuts: "Enter Space",
    hints: ["Enter"],
  },
} as const;

const FORM_FIELD_TAG_NAMES = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const BLOCKING_SHORTCUT_SELECTOR = [
  '[data-slot="dialog-content"]',
  '[data-slot="sheet-content"]',
  '[data-slot="dropdown-menu-content"]',
  '[role="dialog"]',
  '[role="listbox"]',
  '[role="menu"]',
].join(",");

function isHTMLElement(target: EventTarget | null): target is HTMLElement {
  return typeof HTMLElement !== "undefined" && target instanceof HTMLElement;
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!isHTMLElement(target)) {
    return false;
  }

  return (
    target.isContentEditable ||
    FORM_FIELD_TAG_NAMES.has(target.tagName)
  );
}

export function shouldIgnoreTrainingShortcut(event: KeyboardEvent): boolean {
  if (isEditableShortcutTarget(event.target)) {
    return true;
  }

  if (isHTMLElement(event.target)) {
    if (event.target.closest(BLOCKING_SHORTCUT_SELECTOR)) {
      return true;
    }

    if (event.target.ownerDocument.querySelector(BLOCKING_SHORTCUT_SELECTOR)) {
      return true;
    }
  }

  if (typeof document !== "undefined") {
    return Boolean(document.querySelector(BLOCKING_SHORTCUT_SELECTOR));
  }

  return false;
}

export function isPlainShortcutEvent(event: KeyboardEvent): boolean {
  return !event.altKey && !event.ctrlKey && !event.metaKey;
}

export function isSpaceKey(key: string): boolean {
  return key === " " || key === "Spacebar";
}
