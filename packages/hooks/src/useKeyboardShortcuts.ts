import { useEffect } from 'react';

type KeyCombo = string; // e.g. 'ctrl+k', 'meta+k'

export function useKeyboardShortcuts(shortcuts: Record<KeyCombo, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      for (const [combo, handler] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split('+');
        const hasMetaCtrl = parts.includes('meta') || parts.includes('ctrl') || parts.includes('cmd');
        const targetKey = parts[parts.length - 1];

        if (hasMetaCtrl && isMetaOrCtrl && key === targetKey) {
          event.preventDefault();
          handler();
          return;
        } else if (!hasMetaCtrl && key === targetKey) {
          handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
