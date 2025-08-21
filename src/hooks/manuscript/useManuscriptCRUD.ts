// src/hooks/manuscript/useManuscriptCRUD.ts
// UPDATED: Fixed to work with new standardized API response format

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

// ✅ FIXED: Remove automatic view mode switching to preserve current view

export function useManuscriptCRUD(config: CRUDConfig): CRUDActions {
  // ===== ADD OPERATIONS (Updated for new API format) =====
  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      if (!config.novelId) return;

      try {
        console.log("➕ Adding scene to chapter:", chapterId);

        // ✅ UPDATED: New API request format
        const requestBody = {
          title: "New Scene", // Required by new API
          chapterId, // Required by new API
          ...(afterSceneId && { insertAfterSceneId: afterSceneId }),
        };

        const response = await fetch(
          `/api/novels/${config.novelId}/chapters/${chapterId}/scenes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success && result.data) {
            const newScene = result.data;
            console.log("✅ Scene created:", newScene);

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

                      scenes.splice(insertIndex, 0, newScene);
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

            // ✅ FIXED: Only update scene selection, don't change view mode
            // This allows new scenes to appear in document view without switching to scene view
            config.onSelectionUpdate.setSelectedScene(newScene);
            // ❌ REMOVED: config.onSelectionUpdate.setViewMode("scene");

            console.log(
              "✅ Scene added successfully, preserving current view mode"
            );
          } else {
            throw new Error(result.error || "Failed to create scene");
          }
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

        // ✅ UPDATED: New API request format
        const requestBody = {
          title: "New Chapter", // Required by new API
          actId, // Required by new API
          ...(afterChapterId && { insertAfterChapterId: afterChapterId }),
        };

        const response = await fetch(
          `/api/novels/${config.novelId}/acts/${actId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success && result.data) {
            const newChapter = result.data;
            console.log("✅ Chapter created:", newChapter);

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

                    chapters.splice(insertIndex, 0, newChapter);
                    chapters.forEach((chapter, index) => {
                      chapter.order = index + 1;
                    });

                    return { ...act, chapters };
                  }
                  return act;
                }),
              };
            });

            // ✅ FIXED: Only update chapter selection, don't change view mode
            // This allows new chapters to appear in document view without switching to chapter view
            config.onSelectionUpdate.setSelectedChapter(newChapter);
            // ❌ REMOVED: config.onSelectionUpdate.setViewMode("chapter");

            console.log(
              "✅ Chapter added successfully, preserving current view mode"
            );
          } else {
            throw new Error(result.error || "Failed to create chapter");
          }
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

        // ✅ UPDATED: New API request format
        const requestBody = {
          title: title || "New Act", // Required by new API
          novelId: config.novelId, // Required by new API
          ...(insertAfterActId && { insertAfterActId }),
        };

        const response = await fetch(`/api/novels/${config.novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success && result.data) {
            const newAct = result.data;
            console.log("✅ Act created:", newAct);

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

              acts.splice(insertIndex, 0, newAct);
              acts.forEach((act, index) => {
                act.order = index + 1;
              });

              return { ...prevNovel, acts };
            });

            // ✅ FIXED: Only update act selection, don't change view mode
            // This allows new acts to appear in document view without switching to act view
            config.onSelectionUpdate.setSelectedAct(newAct);
            // ❌ REMOVED: config.onSelectionUpdate.setViewMode("act");

            console.log(
              "✅ Act added successfully, preserving current view mode"
            );
          } else {
            throw new Error(result.error || "Failed to create act");
          }
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
  // ===== DELETE OPERATIONS (Updated for new API format) =====

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
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
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
            throw new Error(result.error || "Failed to delete scene");
          }
        } else {
          const error = await response.json();
          console.error("Failed to delete scene:", error);
          alert("Failed to delete scene: " + (error.error || "Unknown error"));
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
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
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
                    .map((chapter, index) => ({
                      ...chapter,
                      order: index + 1,
                    })),
                })),
              };
            });

            // Clear selection if this chapter was selected
            if (config.currentSelections.selectedChapter?.id === chapterId) {
              config.onSelectionUpdate.setSelectedChapter(null);
            }
          } else {
            throw new Error(result.error || "Failed to delete chapter");
          }
        } else {
          const error = await response.json();
          console.error("Failed to delete chapter:", error);
          alert(
            "Failed to delete chapter: " + (error.error || "Unknown error")
          );
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
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
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
            throw new Error(result.error || "Failed to delete act");
          }
        } else {
          const error = await response.json();
          console.error("Failed to delete act:", error);
          alert("Failed to delete act: " + (error.error || "Unknown error"));
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

/*
===== CHANGES MADE =====

✅ UPDATED: All creation requests now include required fields per new API schemas
✅ UPDATED: All responses now handle new standardized format { success, data, message, meta }
✅ UPDATED: Error handling updated for new response structure
✅ MAINTAINED: All existing local state update logic (no page refreshes)
✅ MAINTAINED: Auto-selection of newly created items

===== NEW REQUEST FORMATS =====

Scene Creation:
{
  "title": "New Scene",
  "chapterId": "ch123"
}

Chapter Creation:
{
  "title": "New Chapter", 
  "actId": "act456"
}

Act Creation:
{
  "title": "New Act",
  "novelId": "novel789"
}

===== NEW RESPONSE FORMAT =====
{
  "success": true,
  "data": {  created item  },
  "message": "Item created successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}
*/
