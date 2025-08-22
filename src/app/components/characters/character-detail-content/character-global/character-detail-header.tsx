// app/components/characters/character-detail-content/character-detail-header.tsx
// Header component for character detail page with safe avatar handling

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  Download,
} from "lucide-react";
import { Button, CharacterAvatar } from "@/app/components/ui";

interface CharacterDetailHeaderProps {
  character: {
    id: string;
    name: string;
    species: string;
    imageUrl: string | null;
    gender: string | null;
    birthplace: string | null;
  };
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CharacterDetailHeader: React.FC<CharacterDetailHeaderProps> = ({
  character,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-black border-b border-gray-700 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and character info */}
        <div className="flex items-center space-x-6">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={onBack}
            className="shrink-0"
          >
            Back to Characters
          </Button>

          <div className="flex items-center space-x-4">
            {/* Character Avatar - Using safe CharacterAvatar component */}
            <CharacterAvatar
              name={character.name}
              imageUrl={character.imageUrl}
              size="lg"
            />

            {/* Character Basic Info */}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {character.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{character.species}</span>
                {character.gender && (
                  <>
                    <span>•</span>
                    <span>{character.gender}</span>
                  </>
                )}
                {character.birthplace && (
                  <>
                    <span>•</span>
                    <span>Born in {character.birthplace}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={Edit} onClick={onEdit}>
            Edit Profile
          </Button>

          {/* More actions menu */}
          <div className="relative">
            <Button
              variant="outline"
              icon={MoreVertical}
              onClick={() => setShowMenu(!showMenu)}
            >
              More actions
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Duplicate Character</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Character Sheet</span>
                </button>
                <hr className="border-gray-700" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Character</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
