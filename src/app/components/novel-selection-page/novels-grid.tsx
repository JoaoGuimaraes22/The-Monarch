import React from "react";
import { Novel } from "@/lib/novels";
import { NovelCard } from "./novel-card";
import { EmptyState } from "./empty-state";

interface NovelsGridProps {
  novels: Novel[];
  onEnterWorkspace: (novelId: string) => void;
  onCreateClick: () => void;
  onDeleteNovel: (novelId: string) => Promise<void>;
}

export const NovelsGrid: React.FC<NovelsGridProps> = ({
  novels,
  onEnterWorkspace,
  onCreateClick,
  onDeleteNovel,
}) => {
  if (novels.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {novels.map((novel) => (
        <NovelCard
          key={novel.id}
          novel={novel}
          onEnterWorkspace={onEnterWorkspace}
          onDelete={onDeleteNovel}
        />
      ))}
    </div>
  );
};
