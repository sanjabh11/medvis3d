'use client';

import { Clock, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SessionRestorePromptProps {
  sessionAge: string;
  onRestore: () => void;
  onDismiss: () => void;
}

export function SessionRestorePrompt({
  sessionAge,
  onRestore,
  onDismiss,
}: SessionRestorePromptProps) {
  return (
    <Card className="p-4 border-[--color-medical-primary] bg-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[--color-medical-primary] rounded-full">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-[--color-medical-text-primary]">
              Resume Previous Session?
            </p>
            <p className="text-sm text-[--color-medical-text-secondary]">
              You have an unsaved session from {sessionAge}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <Button size="sm" onClick={onRestore} className="bg-[--color-medical-primary]">
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
        </div>
      </div>
    </Card>
  );
}
