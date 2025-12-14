'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="absolute bottom-4 right-4 p-4 bg-black/80 border-gray-700 text-white min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          Keyboard Shortcuts
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{description}</span>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs font-mono">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </Card>
  );
}
