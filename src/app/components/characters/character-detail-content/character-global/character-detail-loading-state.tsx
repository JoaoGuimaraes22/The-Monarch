// app/components/characters/character-detail-content/character-detail-loading-state.tsx
// Loading state for character detail page

import React from "react";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/app/components/ui";

interface CharacterDetailLoadingStateProps {
  onBack: () => void;
}

export const CharacterDetailLoadingState: React.FC<
  CharacterDetailLoadingStateProps
> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-black border-b border-gray-700 px-8 py-6">
        <Button variant="outline" icon={ArrowLeft} onClick={onBack}>
          Back to Characters
        </Button>
      </div>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-300">Loading character...</p>
        </div>
      </div>
    </div>
  );
};
