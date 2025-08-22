// app/components/characters/character-detail/character-detail-error-state.tsx
// Error state for character detail page

import React from "react";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui";

export const CharacterDetailErrorState: React.FC<{
  error: string;
  onBack: () => void;
}> = ({ error, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-black border-b border-gray-700 px-8 py-6">
        <Button variant="outline" icon={ArrowLeft} onClick={onBack}>
          Back to Characters
        </Button>
      </div>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Error Loading Character
          </h2>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="primary" onClick={onBack}>
              Back to Characters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
