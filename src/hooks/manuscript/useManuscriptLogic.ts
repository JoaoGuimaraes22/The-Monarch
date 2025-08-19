// src/hooks/manuscript/useManuscriptLogic.ts
// ✅ ENHANCED: Added view mode preservation for document view operations + auto-scene chapter creation

import { useRef, useCallback, useEffect } from "react";
import { useManuscriptState } from "./useManuscriptState";
import { useManuscriptCRUD } from "./useManuscriptCRUD";
import { useAutoSave } from "./useAutoSave";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";

export interface ManuscriptLogicReturn {
  // State from useManuscriptState
  novel: NovelWithStructure | null;
  loading: boolean;
  error: string | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;

  // Auto-save state from useAutoSave
  isSavingContent: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  pendingChanges: boolean;

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
  handleViewModeChange: (mode: ViewMode) => void;
  handleContentDisplayModeChange: (mode: ContentDisplayMode) => void;

  // Selection Handlers
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;

  // CRUD Handlers
  handleAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  handleAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  handleAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  handleDeleteScene: (sceneId: string) => Promise<void>;
  handleDeleteChapter: (chapterId: string) => Promise<void>;
  handleDeleteAct: (actId: string) => Promise<void>;

  // Update Handlers
  handleUpdateActName: (actId: string, newTitle: string) => Promise<void>;
  handleUpdateChapterName: (
    chapterId: string,
    newTitle: string
  ) => Promise<void>;
  handleUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;

  // Auto-save handlers
  handleSceneContentChange: (sceneId: string, content: string) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;

  // Utility
  handleRefresh: () => void;
  loadNovelStructure: (id: string) => Promise<void>;
  hasStructure: boolean;
}

export function useManuscriptLogic(novelId: string): ManuscriptLogicReturn {
  // ✨ Use dedicated hooks
  const { state, actions } = useManuscriptState();
  const autoSave = useAutoSave({
    novelId,
    selectedScene: state.selectedScene,
    delay: 2000,
  });

  // ===== UTILITY FUNCTIONS FOR SCENE SELECTION =====

  // ✅ Helper to find first scene in a chapter
  const findFirstSceneInChapter = useCallback(
    (chapter: Chapter): Scene | null => {
      if (!chapter.scenes || chapter.scenes.length === 0) return null;
      const sortedScenes = [...chapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return sortedScenes[0];
    },
    []
  );

  // ✅ Helper to find first scene in an act
  const findFirstSceneInAct = useCallback(
    (act: Act): Scene | null => {
      if (!act.chapters || act.chapters.length === 0) return null;
      const sortedChapters = [...act.chapters].sort(
        (a, b) => a.order - b.order
      );

      for (const chapter of sortedChapters) {
        const firstScene = findFirstSceneInChapter(chapter);
        if (firstScene) return firstScene;
      }
      return null;
    },
    [findFirstSceneInChapter]
  );

  // ✅ NEW: Check if we're in document view mode
  const isInDocumentView = useCallback(() => {
    return state.contentDisplayMode === "document";
  }, [state.contentDisplayMode]);

  // ===== NOVEL LOADING =====
  const loadNovelStructureRef = useRef<((id: string) => Promise<void>) | null>(
    null
  );

  loadNovelStructureRef.current = async (id: string) => {
    console.log("🔄 API CALL: loadNovelStructure called for novelId:", id);
    try {
      actions.setLoading(true);

      const response = await fetch(`/api/novels/${id}/structure`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load novel structure");
      }

      const result = await response.json();

      if (result.success && result.data) {
        actions.updateNovel(() => result.data.novel);
        console.log("✅ Novel structure loaded:", result.data.novel);
      } else {
        throw new Error(result.error || "Failed to load novel structure");
      }
    } catch (error) {
      console.error("❌ Error loading novel structure:", error);
      actions.setError(
        error instanceof Error ? error.message : "Failed to load novel"
      );
    } finally {
      actions.setLoading(false);
    }
  };

  const loadNovelStructure = useCallback(async (id: string) => {
    if (loadNovelStructureRef.current) {
      await loadNovelStructureRef.current(id);
    }
  }, []);

  // ===== SELECTION HANDLERS =====
  const handleSceneSelect = useCallback(
    (sceneId: string, scene: Scene) => {
      actions.setSelectedScene(scene);
      actions.setViewMode("scene");

      // Find and set parent chapter/act
      const parentChapter = state.novel?.acts
        .flatMap((act) => act.chapters)
        .find((chapter) => chapter.scenes.some((s) => s.id === scene.id));

      if (parentChapter) {
        actions.setSelectedChapter(parentChapter);

        const parentAct = state.novel?.acts.find((act) =>
          act.chapters.some((ch) => ch.id === parentChapter.id)
        );

        if (parentAct) {
          actions.setSelectedAct(parentAct);
        }
      }
    },
    [state.novel, actions]
  );

  // ✅ FIXED: Chapter selection now auto-selects first scene for content aggregation
  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      actions.setSelectedChapter(chapter);
      actions.setViewMode("chapter");

      // ✅ CRITICAL FIX: Auto-select first scene so content aggregation works
      const firstScene = findFirstSceneInChapter(chapter);
      if (firstScene) {
        actions.setSelectedScene(firstScene);
      }

      // Find and set parent act
      const parentAct = state.novel?.acts.find((act) =>
        act.chapters.some((ch) => ch.id === chapter.id)
      );

      if (parentAct) {
        actions.setSelectedAct(parentAct);
      }
    },
    [state.novel, actions, findFirstSceneInChapter]
  );

  // ✅ FIXED: Act selection now auto-selects first scene for content aggregation
  const handleActSelect = useCallback(
    (act: Act) => {
      actions.setSelectedAct(act);
      actions.setViewMode("act");

      // ✅ CRITICAL FIX: Auto-select first scene so content aggregation works
      const firstScene = findFirstSceneInAct(act);
      if (firstScene) {
        actions.setSelectedScene(firstScene);

        // Also set the chapter containing this scene
        const parentChapter = act.chapters.find((chapter) =>
          chapter.scenes.some((s) => s.id === firstScene.id)
        );
        if (parentChapter) {
          actions.setSelectedChapter(parentChapter);
        }
      }
    },
    [actions, findFirstSceneInAct]
  );

  // ===== VIEW MODE HANDLERS =====
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      actions.setViewMode(mode);
    },
    [actions]
  );

  const handleContentDisplayModeChange = useCallback(
    (mode: ContentDisplayMode) => {
      actions.setContentDisplayMode(mode);
    },
    [actions]
  );

  // ===== ENHANCED CRUD HANDLERS WITH VIEW MODE PRESERVATION =====

  // ✅ ENHANCED: Scene creation with view mode preservation
  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      if (!novelId) return;

      try {
        console.log("➕ Adding scene to chapter:", chapterId);

        const requestBody = {
          title: "New Scene",
          chapterId,
          ...(afterSceneId && { insertAfterSceneId: afterSceneId }),
        };

        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}/scenes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newScene = result.data;
            console.log("✅ Scene created:", newScene);

            // ✅ LOCAL STATE UPDATE
            actions.updateNovel((prevNovel) => {
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

            // ✅ NEW: Smart selection based on current view mode
            if (
              isInDocumentView() &&
              (state.viewMode === "chapter" || state.viewMode === "act")
            ) {
              // In document view: Don't change view mode, just refresh the selected scene for content aggregation
              console.log(
                "📄 Document view: Preserving view mode, updating selected scene for content refresh"
              );
              actions.setSelectedScene(newScene);
              // Keep existing viewMode and chapter/act selections
            } else {
              // In grid view or sidebar creation: Traditional behavior
              console.log("🎯 Grid view or sidebar: Selecting new scene");
              actions.setSelectedScene(newScene);
              actions.setViewMode("scene");
            }
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
    [
      novelId,
      actions,
      state.viewMode,
      state.contentDisplayMode,
      isInDocumentView,
    ]
  );

  // ✅ ENHANCED: Chapter creation with view mode preservation + auto-scene creation
  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      if (!novelId) return;

      try {
        console.log("➕ Adding chapter to act:", actId);

        const requestBody = {
          title: "New Chapter",
          actId,
          ...(afterChapterId && { insertAfterChapterId: afterChapterId }),
        };

        const response = await fetch(
          `/api/novels/${novelId}/acts/${actId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newChapter = result.data;
            console.log("✅ Chapter created with auto-scene:", newChapter);

            // ✅ LOCAL STATE UPDATE
            actions.updateNovel((prevNovel) => {
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

            // ✅ NEW: Smart selection based on current view mode
            if (isInDocumentView() && state.viewMode === "act") {
              // In act document view: Stay in act view, but select new chapter's first scene for content aggregation
              console.log(
                "📄 Act document view: Preserving act view, updating selections for content refresh"
              );
              const firstScene = findFirstSceneInChapter(newChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
                actions.setSelectedChapter(newChapter);
                // Keep viewMode as "act"
              }
            } else {
              // In other views: Traditional behavior - select the new chapter
              console.log("🎯 Other view: Selecting new chapter");
              actions.setSelectedChapter(newChapter);
              actions.setViewMode("chapter");

              // Auto-select first scene for content aggregation
              const firstScene = findFirstSceneInChapter(newChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
              }
            }
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
    [
      novelId,
      actions,
      state.viewMode,
      state.contentDisplayMode,
      isInDocumentView,
      findFirstSceneInChapter,
    ]
  );

  // ✅ ENHANCED: Act creation (traditional behavior since acts aren't created from document view)
  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!novelId) return;

      try {
        console.log("➕ Adding act to novel:", novelId);

        const requestBody = {
          title: title || "New Act",
          novelId,
          ...(insertAfterActId && { insertAfterActId }),
        };

        const response = await fetch(`/api/novels/${novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newAct = result.data;
            console.log("✅ Act created:", newAct);

            // ✅ LOCAL STATE UPDATE
            actions.updateNovel((prevNovel) => {
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

            // ✅ AUTO-SELECT NEW ACT (traditional behavior)
            actions.setSelectedAct(newAct);
            actions.setViewMode("act");

            // Find first scene for content aggregation
            const firstScene = findFirstSceneInAct(newAct);
            if (firstScene) {
              actions.setSelectedScene(firstScene);
              const parentChapter = newAct.chapters.find((chapter: Chapter) =>
                chapter.scenes.some((s: Scene) => s.id === firstScene.id)
              );
              if (parentChapter) {
                actions.setSelectedChapter(parentChapter);
              }
            }
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
    [novelId, actions, findFirstSceneInAct]
  );

  // ===== DELETE HANDLERS (using existing CRUD) =====
  const crud = useManuscriptCRUD({
    novelId,
    onStateUpdate: actions.updateNovel,
    onSelectionUpdate: {
      setSelectedScene: actions.setSelectedScene,
      setSelectedChapter: actions.setSelectedChapter,
      setSelectedAct: actions.setSelectedAct,
      setViewMode: actions.setViewMode,
    },
    currentSelections: {
      selectedScene: state.selectedScene,
      selectedChapter: state.selectedChapter,
      selectedAct: state.selectedAct,
    },
  });

  // ===== UPDATE HANDLERS (Fixed for new API format) =====
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

          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) =>
                act.id === actId ? { ...act, title: newTitle } : act
              ),
            };
          });

          if (state.selectedAct?.id === actId) {
            actions.setSelectedAct({ ...state.selectedAct, title: newTitle });
          }
        } else {
          throw new Error(result.error || "Failed to update act name");
        }
      } catch (error) {
        console.error("Error updating act name:", error);
        throw error;
      }
    },
    [novelId, state.selectedAct, actions]
  );

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

          if (state.selectedChapter?.id === chapterId) {
            actions.setSelectedChapter({
              ...state.selectedChapter,
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
    [novelId, state.selectedChapter, actions]
  );

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

          if (state.selectedScene?.id === sceneId) {
            actions.setSelectedScene({
              ...state.selectedScene,
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
    [novelId, state.selectedScene, actions]
  );

  // ===== UTILITY FUNCTIONS =====
  const handleRefresh = useCallback(() => {
    console.log("🔄 EXPLICIT REFRESH: User action triggered refresh");
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (novelId) {
      console.log("🚀 Initial load for novelId:", novelId);
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]);

  // ===== COMPUTED VALUES =====
  const hasStructure =
    state.novel && state.novel.acts && state.novel.acts.length > 0;

  // ===== RETURN INTERFACE =====
  return {
    // State from useManuscriptState hook
    ...state,

    // Auto-save state from useAutoSave hook
    isSavingContent: autoSave.state.isSaving,
    lastSaved: autoSave.state.lastSaved,
    autoSaveEnabled: autoSave.state.enabled,
    pendingChanges: autoSave.state.pendingChanges,

    // UI Actions
    setViewMode: actions.setViewMode,
    setContentDisplayMode: actions.setContentDisplayMode,
    handleViewModeChange,
    handleContentDisplayModeChange,

    // Selection Handlers (FIXED with auto-scene selection)
    handleSceneSelect,
    handleChapterSelect,
    handleActSelect,

    // CRUD Handlers (ENHANCED with view mode preservation)
    handleAddScene, // ✅ Preserves document view mode
    handleAddChapter, // ✅ Preserves act document view + auto-scene creation
    handleAddAct, // ✅ Traditional behavior
    handleDeleteScene: crud.handleDeleteScene,
    handleDeleteChapter: crud.handleDeleteChapter,
    handleDeleteAct: crud.handleDeleteAct,

    // Update Handlers (Fixed for new API format)
    handleUpdateActName,
    handleUpdateChapterName,
    handleUpdateSceneName,

    // Auto-save handlers from useAutoSave hook
    handleSceneContentChange: autoSave.actions.handleContentChange,
    setAutoSaveEnabled: autoSave.actions.setEnabled,
    handleManualSave: async () => {
      await autoSave.actions.handleManualSave();
    },

    // Utility
    handleRefresh,
    loadNovelStructure,
    hasStructure: !!hasStructure,
  };
}

/*
===== KEY ENHANCEMENTS IMPLEMENTED =====

✅ AUTO-SCENE CHAPTER CREATION: New chapters automatically include "Scene 1"
✅ VIEW MODE PRESERVATION: Document view operations stay in document view
✅ SMART SELECTION: Auto-selects appropriate scenes for content aggregation
✅ DOCUMENT VIEW STABILITY: Adding scenes/chapters in document view doesn't switch views

===== NEW BEHAVIOR MATRIX =====

| Action | Current View | Result |
|--------|--------------|--------|
| Add Scene | Chapter Document | Stay in Chapter Document + show new scene inline |
| Add Scene | Act Document | Stay in Act Document + show new scene inline |
| Add Scene | Grid/Sidebar | Switch to Scene view (traditional) |
| Add Chapter | Act Document | Stay in Act Document + show new chapter inline |
| Add Chapter | Sidebar | Switch to Chapter view (traditional) |
| Add Act | Any | Switch to Act view (traditional) |

===== CONTENT AGGREGATION FIX =====

- Chapter/Act clicks now auto-select first scene
- Content aggregation service gets the scene it needs
- View properly displays chapter/act content
- No more empty content areas

===== IMPLEMENTATION DETAILS =====

1. **isInDocumentView()**: Checks if contentDisplayMode === "document"
2. **Smart Selection Logic**: Different behavior for document vs grid/sidebar
3. **Auto-Scene Creation**: Chapter service creates Scene 1 automatically
4. **State Updates**: Proper local state updates prevent page refreshes
5. **Content Refresh**: New scenes/chapters appear immediately in document view

This solves all the specified requirements! 🎉
*/
