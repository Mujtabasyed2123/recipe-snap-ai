'use client';

import type * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { SuggestSubstitutionsOutput } from '@/ai/flows/suggest-substitutions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ingredientName: string | null;
  substitutions: SuggestSubstitutionsOutput | null;
  isLoading: boolean;
  error?: string | null;
}

export function SubstitutionModal({
  isOpen,
  onOpenChange,
  ingredientName,
  substitutions,
  isLoading,
  error,
}: SubstitutionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Substitutions for {ingredientName || 'Ingredient'}
          </DialogTitle>
          <DialogDescription>
            Here are some AI-powered suggestions for what you can use instead.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          {isLoading && <LoadingSpinner text="Finding substitutions..." className="my-8" />}
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && substitutions && (
            <div className="space-y-4 py-4">
              {substitutions.substitutions.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside pl-2">
                  {substitutions.substitutions.map((sub, index) => (
                    <li key={index} className="text-foreground">
                      {sub}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific substitutions found. You might need to get creative or try a different ingredient!</p>
              )}
              {substitutions.reasoning && (
                <Alert className="bg-background">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Chef's Reasoning</AlertTitle>
                  <AlertDescription className="text-sm">
                    {substitutions.reasoning}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
