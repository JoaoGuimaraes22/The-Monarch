// app/components/characters/main-page-content/character-card.tsx
// Individual character card component with navigation to detail page

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharacterCardProps {
  character: CharacterWithCurrentState;
  novelId: string; // Add novelId for navigation
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (character: CharacterWithCurrentState) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  novelId,
  onDelete,
  onEdit,
}) => {
  const router = useRouter();
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
    router.push(`/novels/${novelId}/characters/${character.id}`);
    setShowMenu(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on menu button or menu
    if (
      (e.target as HTMLElement).closest(".menu-button") ||
      (e.target as HTMLElement).closest(".dropdown-menu")
    ) {
      return;
    }

    // Navigate to character detail page
    router.push(`/novels/${novelId}/characters/${character.id}`);
  };

  return (
    <Card hover className="relative cursor-pointer" onClick={handleCardClick}>
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
            <h3 className="font-semibold text-white text-lg">
              {character.name}
            </h3>
            <p className="text-sm text-gray-400">{character.species}</p>
          </div>

          {/* Action Menu */}
          <div className="relative menu-button">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              disabled={isDeleting}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 dropdown-menu"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Character
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
