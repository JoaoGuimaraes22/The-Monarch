// app/components/characters/characters-empty-state.tsx
// Empty state when no characters exist

import React from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/app/components/ui";

interface CharactersEmptyStateProps {
  onCreateClick: () => void;
}

export const CharactersEmptyState: React.FC<CharactersEmptyStateProps> = ({
  onCreateClick,
}) => {
  return (
    <div className="p-8">
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Character Vault
        </h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Start building your cast of characters. Create detailed profiles,
          track relationships, and manage character arcs across your story.
        </p>
        <Button variant="primary" icon={Plus} onClick={onCreateClick}>
          Create Your First Character
        </Button>
      </div>
    </div>
  );
};
