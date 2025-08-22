// app/components/characters/characters-loading-state.tsx
// Loading state for characters page

import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/app/components/ui";

export const CharactersLoadingState: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading characters...</p>
        </div>
      </div>
    </div>
  );
};
