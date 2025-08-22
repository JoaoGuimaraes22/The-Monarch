// app/components/characters/characters-error-state.tsx
// Error state for characters page

import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/app/components/ui";

interface CharactersErrorStateProps {
  error: string;
}

export const CharactersErrorState: React.FC<CharactersErrorStateProps> = ({
  error,
}) => {
  return (
    <div className="p-8">
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Error Loading Characters
        </h2>
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
};
