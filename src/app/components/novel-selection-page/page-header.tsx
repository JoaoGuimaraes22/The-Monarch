import React from "react";
import { Plus } from "lucide-react";
import { Button, Logo } from "@/app/components/ui";

interface PageHeaderProps {
  onCreateClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onCreateClick }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="md" variant="light" />
            <div className="border-l border-gray-600 pl-4">
              <h1 className="text-3xl font-bold text-white">Your Novels</h1>
              <p className="text-gray-300">
                Choose a project or start something new
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={onCreateClick}
          >
            Create New Novel
          </Button>
        </div>
      </div>
    </div>
  );
};
