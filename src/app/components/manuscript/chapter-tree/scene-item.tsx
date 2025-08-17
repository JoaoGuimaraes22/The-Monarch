// chapter-tree/scene-item.tsx
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { TreeItem } from "./tree-item";
import { SceneItemProps } from "./types";
import { formatWordCount, getSceneStatus } from "./utils";

export const SceneItem: React.FC<SceneItemProps> = ({
  scene,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const status = getSceneStatus(scene);

  return (
    <TreeItem
      level={2}
      isSelected={isSelected}
      onClick={() => onSelect(scene.id, scene)}
      icon={<span className={`text-sm ${status.color}`}>{status.icon}</span>}
      title={`Scene ${scene.order}`}
      subtitle={`${formatWordCount(scene.wordCount)} words`}
      actions={
        <div className="flex space-x-1">
          <button className="p-0.5 hover:bg-gray-600 rounded">
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(scene.id, `Scene ${scene.order}`);
            }}
            className="p-0.5 hover:bg-gray-600 rounded text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      }
    />
  );
};
