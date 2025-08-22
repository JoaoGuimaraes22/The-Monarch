// app/components/characters/characters-header.tsx
// Header section for characters page

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui";

interface CharactersHeaderProps {
  onCreateClick: () => void;
}

export const CharactersHeader: React.FC<CharactersHeaderProps> = ({
  onCreateClick,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Character Vault</h1>
        <p className="text-gray-300">
          Manage your characters, relationships, and story arcs
        </p>
      </div>
      <Button variant="primary" icon={Plus} onClick={onCreateClick}>
        Add Character
      </Button>
    </div>
  );
};
