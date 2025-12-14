'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onResetView?: () => void;
  onToggleWireframe?: () => void;
  onToggleFullscreen?: () => void;
  onCaptureScreenshot?: () => void;
  onIncreaseDepth?: () => void;
  onDecreaseDepth?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onResetView,
  onToggleWireframe,
  onToggleFullscreen,
  onCaptureScreenshot,
  onIncreaseDepth,
  onDecreaseDepth,
  enabled = true,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          // R - Reset view
          event.preventDefault();
          onResetView?.();
          break;

        case 'w':
          // W - Toggle wireframe
          event.preventDefault();
          onToggleWireframe?.();
          break;

        case 'f':
          // F - Toggle fullscreen
          event.preventDefault();
          onToggleFullscreen?.();
          break;

        case 's':
          // Ctrl/Cmd + S - Screenshot
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onCaptureScreenshot?.();
          }
          break;

        case 'arrowup':
          // Arrow Up - Increase depth
          event.preventDefault();
          onIncreaseDepth?.();
          break;

        case 'arrowdown':
          // Arrow Down - Decrease depth
          event.preventDefault();
          onDecreaseDepth?.();
          break;

        case 'escape':
          // Escape - Exit fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    },
    [
      enabled,
      onResetView,
      onToggleWireframe,
      onToggleFullscreen,
      onCaptureScreenshot,
      onIncreaseDepth,
      onDecreaseDepth,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'R', description: 'Reset view' },
  { key: 'W', description: 'Toggle wireframe' },
  { key: 'F', description: 'Toggle fullscreen' },
  { key: '⌘/Ctrl + S', description: 'Save screenshot' },
  { key: '↑/↓', description: 'Adjust depth' },
  { key: 'Esc', description: 'Exit fullscreen' },
];
