// src/hooks/manuscript/useManuscriptCRUD.ts
// ✨ PHASE 3: Extract CRUD operations with local state updates - NO MORE PAGE REFRESHES

import { useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";

export interface CRUDConfig {
  novelId: string;
  onStateUpdate: (
    updater: (prev: NovelWithStructure | null) => NovelWithStructure | null
  ) => void;
  onSelectionUpdate: {
    setSelectedScene: (scene: Scene | null) => void;
    setSelectedChapter: (chapter: Chapter | null) => void;
    setSelectedAct: (act: Act | null) => void;
    setViewMode: (mode: ViewMode) => void;
  };
  currentSelections: {
    selectedScene: Scene | null;
    selectedChapter: Chapter | null;
    selectedAct: Act | null;
  };
}

export interface CRUDActions {
  handleAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  handleAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  handleAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  handleDeleteScene: (sceneId: string) => Promise<void>;
  handleDeleteChapter: (chapterId: string) => Promise<void>;
  handleDeleteAct: (actId: string) => Promise<void>;
}

export function useManuscriptCRUD(config: CRUDConfig): CRUDActions {
  // ===== ADD OPERATIONS (with local state updates - NO RELOAD) =====

  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      if (!config.novelId) return;

      try {
        console.log("➕ Adding scene to chapter:", chapterId);

        const requestBody = afterSceneId
          ? { insertAfterSceneId: afterSceneId }
          : {};
        const response = await fetch(
          `/api/novels/${config.novelId}/chapters/${chapterId}/scenes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Scene created:", result.scene);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) => {
                  if (chapter.id === chapterId) {
                    const scenes = [...chapter.scenes];
                    let insertIndex = scenes.length;

                    if (afterSceneId) {
                      const afterIndex = scenes.findIndex(
                        (s) => s.id === afterSceneId
                      );
                      if (afterIndex >= 0) {
                        insertIndex = afterIndex + 1;
                      }
                    }

                    scenes.splice(insertIndex, 0, result.scene);
                    scenes.forEach((scene, index) => {
                      scene.order = index + 1;
                    });

                    return { ...chapter, scenes };
                  }
                  return chapter;
                }),
              })),
            };
          });

          // ✅ AUTO-SELECT NEW SCENE
          config.onSelectionUpdate.setSelectedScene(result.scene);
          config.onSelectionUpdate.setViewMode("scene");
        } else {
          const error = await response.json();
          console.error("Failed to create scene:", error);
          alert("Failed to create scene: " + (error.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error creating scene:", error);
        alert("Error creating scene. Please try again.");
      }
    },
    [config]
  );

  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      if (!config.novelId) return;

      try {
        console.log("➕ Adding chapter to act:", actId);

        const requestBody = afterChapterId
          ? { insertAfterChapterId: afterChapterId }
          : {};
        const response = await fetch(
          `/api/novels/${config.novelId}/acts/${actId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Chapter created:", result.chapter);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => {
                if (act.id === actId) {
                  const chapters = [...act.chapters];
                  let insertIndex = chapters.length;

                  if (afterChapterId) {
                    const afterIndex = chapters.findIndex(
                      (c) => c.id === afterChapterId
                    );
                    if (afterIndex >= 0) {
                      insertIndex = afterIndex + 1;
                    }
                  }

                  chapters.splice(insertIndex, 0, result.chapter);
                  chapters.forEach((chapter, index) => {
                    chapter.order = index + 1;
                  });

                  return { ...act, chapters };
                }
                return act;
              }),
            };
          });

          // ✅ AUTO-SELECT NEW CHAPTER
          config.onSelectionUpdate.setSelectedChapter(result.chapter);
          config.onSelectionUpdate.setViewMode("chapter");
        } else {
          const error = await response.json();
          console.error("Failed to create chapter:", error);
          alert(
            "Failed to create chapter: " + (error.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error creating chapter:", error);
        alert("Error creating chapter. Please try again.");
      }
    },
    [config]
  );

  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!config.novelId) return;

      try {
        console.log("➕ Adding act:", title);

        const requestBody = {
          title: title || "New Act",
          ...(insertAfterActId && { insertAfterActId }),
        };
        const response = await fetch(`/api/novels/${config.novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Act created:", result.act);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            const acts = [...prevNovel.acts];
            let insertIndex = acts.length;

            if (insertAfterActId) {
              const afterIndex = acts.findIndex(
                (a) => a.id === insertAfterActId
              );
              if (afterIndex >= 0) {
                insertIndex = afterIndex + 1;
              }
            }

            acts.splice(insertIndex, 0, result.act);
            acts.forEach((act, index) => {
              act.order = index + 1;
            });

            return { ...prevNovel, acts };
          });

          // ✅ AUTO-SELECT NEW ACT
          config.onSelectionUpdate.setSelectedAct(result.act);
          config.onSelectionUpdate.setViewMode("act");
        } else {
          const error = await response.json();
          console.error("Failed to create act:", error);
          alert("Failed to create act: " + (error.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error creating act:", error);
        alert("Error creating act. Please try again.");
      }
    },
    [config]
  );

  // ===== DELETE OPERATIONS (with local state updates - NO RELOAD) =====

  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      if (!config.novelId) return;

      try {
        console.log("🗑️ Deleting scene:", sceneId);

        const response = await fetch(
          `/api/novels/${config.novelId}/scenes/${sceneId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Scene deleted:", sceneId);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) => ({
                  ...chapter,
                  scenes: chapter.scenes
                    .filter((scene) => scene.id !== sceneId)
                    .map((scene, index) => ({ ...scene, order: index + 1 })),
                })),
              })),
            };
          });

          // Clear selection if this scene was selected
          if (config.currentSelections.selectedScene?.id === sceneId) {
            config.onSelectionUpdate.setSelectedScene(null);
          }
        } else {
          console.error("Failed to delete scene");
          alert("Failed to delete scene. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting scene:", error);
        alert("Error deleting scene. Please try again.");
      }
    },
    [config]
  );

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      if (!config.novelId) return;

      try {
        console.log("🗑️ Deleting chapter:", chapterId);

        const response = await fetch(
          `/api/novels/${config.novelId}/chapters/${chapterId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Chapter deleted:", chapterId);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters
                  .filter((chapter) => chapter.id !== chapterId)
                  .map((chapter, index) => ({ ...chapter, order: index + 1 })),
              })),
            };
          });

          // Clear selection if this chapter was selected
          if (config.currentSelections.selectedChapter?.id === chapterId) {
            config.onSelectionUpdate.setSelectedChapter(null);
          }
        } else {
          console.error("Failed to delete chapter");
          alert("Failed to delete chapter. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Error deleting chapter. Please try again.");
      }
    },
    [config]
  );

  const handleDeleteAct = useCallback(
    async (actId: string) => {
      if (!config.novelId) return;

      try {
        console.log("🗑️ Deleting act:", actId);

        const response = await fetch(
          `/api/novels/${config.novelId}/acts/${actId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Act deleted:", actId);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          config.onStateUpdate((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts
                .filter((act) => act.id !== actId)
                .map((act, index) => ({ ...act, order: index + 1 })),
            };
          });

          // Clear selection if this act was selected
          if (config.currentSelections.selectedAct?.id === actId) {
            config.onSelectionUpdate.setSelectedAct(null);
          }
        } else {
          console.error("Failed to delete act");
          alert("Failed to delete act. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting act:", error);
        alert("Error deleting act. Please try again.");
      }
    },
    [config]
  );

  // ===== RETURN CRUD ACTIONS =====
  return {
    handleAddScene,
    handleAddChapter,
    handleAddAct,
    handleDeleteScene,
    handleDeleteChapter,
    handleDeleteAct,
  };
}
