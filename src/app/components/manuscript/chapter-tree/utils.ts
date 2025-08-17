// chapter-tree/utils.ts
import { Scene } from "@/lib/novels";
import { SceneStatus } from "./types";

/**
 * Format word count for display (e.g., 1234 -> "1.2k")
 */
export const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

/**
 * Get scene status icon and color based on scene status
 */
export const getSceneStatus = (scene: Scene): SceneStatus => {
  switch (scene.status) {
    case "complete":
      return { icon: "✅", color: "text-green-400" };
    case "review":
      return { icon: "🔄", color: "text-yellow-400" };
    default:
      return { icon: "📝", color: "text-gray-400" };
  }
};

/**
 * Generate tree item padding based on level
 */
export const getTreeItemPadding = (level: number): string => {
  return `${level * 16 + 8}px`;
};
