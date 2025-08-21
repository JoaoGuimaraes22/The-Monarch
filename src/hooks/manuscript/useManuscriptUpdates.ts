// src/hooks/manuscript/useManuscriptUpdates.ts
// Update handlers for manuscript elements (acts, chapters, scenes)

import { useCallback } from "react";
import { Scene, Chapter, Act } from "@/lib/novels";
import { ManuscriptStateActions } from "./useManuscriptState";

export interface UpdateConfig {
  novelId: string;
  actions: ManuscriptStateActions;
  currentSelections: {
    selectedScene: Scene | null;
    selectedChapter: Chapter | null;
    selectedAct: Act | null;
  };
}

export interface UpdateHandlers {
  handleUpdateActName: (actId: string, newTitle: string) => Promise<void>;
  handleUpdateChapterName: (
    chapterId: string,
    newTitle: string
  ) => Promise<void>;
  handleUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;
}

export function useManuscriptUpdates(config: UpdateConfig): UpdateHandlers {
  const { novelId, actions, currentSelections } = config;

  // ===== ACT UPDATE HANDLER =====
  const handleUpdateActName = useCallback(
    async (actId: string, newTitle: string) => {
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update act name");
        }

        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Act name updated:", result.data);

          // Update local state
          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) =>
                act.id === actId ? { ...act, title: newTitle } : act
              ),
            };
          });

          // Update selected act if it's the one being updated
          if (currentSelections.selectedAct?.id === actId) {
            actions.setSelectedAct({
              ...currentSelections.selectedAct,
              title: newTitle,
            });
          }
        } else {
          throw new Error(result.error || "Failed to update act name");
        }
      } catch (error) {
        console.error("Error updating act name:", error);
        throw error;
      }
    },
    [novelId, currentSelections.selectedAct, actions]
  );

  // ===== CHAPTER UPDATE HANDLER =====
  const handleUpdateChapterName = useCallback(
    async (chapterId: string, newTitle: string) => {
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update chapter name");
        }

        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Chapter name updated:", result.data);

          // Update local state
          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? { ...chapter, title: newTitle }
                    : chapter
                ),
              })),
            };
          });

          // Update selected chapter if it's the one being updated
          if (currentSelections.selectedChapter?.id === chapterId) {
            actions.setSelectedChapter({
              ...currentSelections.selectedChapter,
              title: newTitle,
            });
          }
        } else {
          throw new Error(result.error || "Failed to update chapter name");
        }
      } catch (error) {
        console.error("Error updating chapter name:", error);
        throw error;
      }
    },
    [novelId, currentSelections.selectedChapter, actions]
  );

  // ===== SCENE UPDATE HANDLER =====
  const handleUpdateSceneName = useCallback(
    async (sceneId: string, newTitle: string) => {
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update scene name");
        }

        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Scene name updated:", result.data);

          // Update local state
          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) => ({
                  ...chapter,
                  scenes: chapter.scenes.map((scene) =>
                    scene.id === sceneId ? { ...scene, title: newTitle } : scene
                  ),
                })),
              })),
            };
          });

          // Update selected scene if it's the one being updated
          if (currentSelections.selectedScene?.id === sceneId) {
            actions.setSelectedScene({
              ...currentSelections.selectedScene,
              title: newTitle,
            });
          }
        } else {
          throw new Error(result.error || "Failed to update scene name");
        }
      } catch (error) {
        console.error("Error updating scene name:", error);
        throw error;
      }
    },
    [novelId, currentSelections.selectedScene, actions]
  );

  // ===== RETURN INTERFACE =====
  return {
    handleUpdateActName,
    handleUpdateChapterName,
    handleUpdateSceneName,
  };
}
