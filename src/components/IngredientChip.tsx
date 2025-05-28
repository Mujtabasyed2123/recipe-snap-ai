'use client';

import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface IngredientChipProps {
  ingredient: string;
  onRemove: () => void;
  className?: string;
}

export function IngredientChip({
  ingredient,
  onRemove,
  className,
}: IngredientChipProps) {
  return (
    <Badge
      variant="secondary"
      className={`py-2 px-3 text-sm font-medium flex items-center space-x-2 ${className}`}
    >
      <span>{ingredient}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
        onClick={onRemove}
        aria-label={`Remove ${ingredient}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </Badge>
  );
}
