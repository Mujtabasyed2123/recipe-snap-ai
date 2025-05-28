import { CookingPot } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-background shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center space-x-3">
        <CookingPot className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Recipe Snap
        </h1>
      </div>
    </header>
  );
}
