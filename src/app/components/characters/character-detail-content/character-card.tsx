// app/components/characters/character-card.tsx
// Individual character card component

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharacterCardProps {
  character: CharacterWithCurrentState;
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (character: CharacterWithCurrentState) => void;
  onView?: (character: CharacterWithCurrentState) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onDelete,
  onEdit,
  onView,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${character.name}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(character.id);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(character);
    }
    setShowMenu(false);
  };

  const handleView = () => {
    if (onView) {
      onView(character);
    }
    setShowMenu(false);
  };

  return (
    <Card hover className="relative">
      <CardContent className="p-6">
        {/* Character Avatar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {character.imageUrl ? (
              <Image
                src={character.imageUrl}
                alt={character.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-300">
                {character.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{character.name}</h3>
            <p className="text-sm text-gray-400">{character.species}</p>
          </div>

          {/* Options Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              disabled={isDeleting}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[140px]">
                {onView && (
                  <button
                    onClick={handleView}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                <hr className="border-gray-700" />
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Character Info */}
        <div className="space-y-3">
          {character.currentState?.title && (
            <div>
              <p className="text-xs text-gray-500">Current Title</p>
              <p className="text-sm text-gray-300">
                {character.currentState.title}
              </p>
            </div>
          )}

          {character.currentState?.faction && (
            <div>
              <p className="text-xs text-gray-500">Faction</p>
              <p className="text-sm text-gray-300">
                {character.currentState.faction}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-gray-500">POV Scenes</p>
              <p className="text-gray-300">{character.povSceneCount}</p>
            </div>
            {character.currentState?.age && (
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="text-gray-300">{character.currentState.age}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
