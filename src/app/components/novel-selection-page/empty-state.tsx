import React from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/app/components/ui";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center py-16">
      <BookOpen className="w-24 h-24 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-white mb-2">
        Ready to start your first epic?
      </h2>
      <p className="text-gray-300 mb-8 max-w-md mx-auto">
        Create your first novel project and begin organizing your characters,
        plot threads, and world-building.
      </p>
      <Button variant="primary" size="lg" icon={Plus} onClick={onCreateClick}>
        Create Your First Novel
      </Button>
    </div>
  );
};
