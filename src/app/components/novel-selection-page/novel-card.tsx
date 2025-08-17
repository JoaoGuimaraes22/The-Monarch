import React, { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  FileText,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { Card, CardContent, Button } from "@/app/components/ui";
import { Novel } from "@/lib/novels";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

interface NovelCardProps {
  novel: Novel;
  onEnterWorkspace: (novelId: string) => void;
  onDelete: (novelId: string) => Promise<void>;
}

export const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onEnterWorkspace,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug log
  console.log("NovelCard render:", { showMenu, showDeleteDialog });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k words`;
    }
    return `${count} words`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    console.log("Delete button clicked"); // Debug log
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    setShowDeleteDialog(true);
    console.log("Dialog should open now"); // Debug log
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(novel.id);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handling is done by parent component
      console.error("Failed to delete novel:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        hover
        className="cursor-pointer relative bg-gray-800 border-gray-700 shadow-lg"
      >
        {/* Menu Button */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 bg-gray-900 bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-300" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    // TODO: Add edit functionality
                    console.log("Edit novel:", novel.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg cursor-pointer transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full h-48 bg-gray-800 rounded-t-lg overflow-hidden">
          {novel.coverImage ? (
            <Image
              src={novel.coverImage}
              alt={`${novel.title} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-red-500" />
            </div>
          )}
        </div>

        <CardContent className="pt-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {novel.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {novel.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{formatWordCount(novel.wordCount)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(novel.updatedAt)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => onEnterWorkspace(novel.id)}
          >
            Enter Workspace
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        novelTitle={novel.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
      />

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </>
  );
};
