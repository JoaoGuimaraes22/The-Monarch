// src/hooks/manuscript/useManuscriptLogic.ts
// ✨ FIXED: Proper real-time state updates for positioned adding

import { useState, useEffect, useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";

export interface ManuscriptLogicReturn {
  // State
  novel: NovelWithStructure | null;
  loading: boolean;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: "document" | "grid";

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: "document" | "grid") => void;
  handleViewModeChange: (newViewMode: ViewMode) => void;
  handleContentDisplayModeChange: (newMode: "document" | "grid") => void;

  // Selection Handlers
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;

  // ✨ FIXED: CRUD Handlers with proper signatures
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

  // Utility
  handleRefresh: () => void;
  loadNovelStructure: (id: string) => Promise<void>;
  hasStructure: boolean;
}

export function useManuscriptLogic(novelId: string): ManuscriptLogicReturn {
  // ===== STATE MANAGEMENT =====
  const [novel, setNovel] = useState<NovelWithStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("scene");
  const [contentDisplayMode, setContentDisplayMode] = useState<
    "document" | "grid"
  >("document");

  // ===== CORE API OPERATIONS =====
  const loadNovelStructure = useCallback(
    async (id: string) => {
      console.log("🔄 API CALL: loadNovelStructure called");
      try {
        setLoading(true);
        const response = await fetch(`/api/novels/${id}/structure`);
        if (response.ok) {
          const novelData = await response.json();
          setNovel(novelData);

          // Only auto-select if no scene is currently selected
          if (novelData.acts && novelData.acts.length > 0) {
            let sceneStillExists = false;
            if (selectedScene) {
              for (const act of novelData.acts) {
                for (const chapter of act.chapters) {
                  if (
                    chapter.scenes.some((s: Scene) => s.id === selectedScene.id)
                  ) {
                    sceneStillExists = true;
                    break;
                  }
                }
                if (sceneStillExists) break;
              }
            }

            if (!selectedScene || !sceneStillExists) {
              const firstAct = novelData.acts[0];
              if (firstAct && firstAct.chapters.length > 0) {
                const firstChapter = firstAct.chapters[0];
                if (firstChapter.scenes.length > 0) {
                  const firstScene = firstChapter.scenes[0];
                  setSelectedScene(firstScene);
                  console.log("Auto-selected first scene:", firstScene.title);
                }
              }
            }
          }
        } else {
          console.error("Failed to load novel structure");
        }
      } catch (error) {
        console.error("Error loading novel structure:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedScene]
  );

  // ===== UI ACTION HANDLERS =====
  const handleContentDisplayModeChange = useCallback(
    (newMode: "document" | "grid") => {
      setContentDisplayMode(newMode);
    },
    []
  );

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      if (selectedScene && novel?.acts) {
        if (newViewMode === "chapter") {
          for (const act of novel.acts) {
            for (const chapter of act.chapters) {
              if (
                chapter.scenes.some((scene) => scene.id === selectedScene.id)
              ) {
                console.log("Auto-selecting chapter:", chapter.title);
                setSelectedChapter(chapter);
                setSelectedAct(null);
                setViewMode("chapter");
                return;
              }
            }
          }
        } else if (newViewMode === "act") {
          for (const act of novel.acts) {
            for (const chapter of act.chapters) {
              if (
                chapter.scenes.some((scene) => scene.id === selectedScene.id)
              ) {
                console.log("Auto-selecting act:", act.title);
                setSelectedAct(act);
                setSelectedChapter(null);
                setViewMode("act");
                return;
              }
            }
          }
        } else if (newViewMode === "scene") {
          setSelectedChapter(null);
          setSelectedAct(null);
          setViewMode("scene");
          return;
        }
      }
      setViewMode(newViewMode);
    },
    [selectedScene, novel]
  );

  // ===== SELECTION HANDLERS =====
  const handleSceneSelect = useCallback((sceneId: string, scene: Scene) => {
    setSelectedScene(scene);
    setViewMode("scene");
    setSelectedChapter(null);
    setSelectedAct(null);
  }, []);

  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      setSelectedChapter(chapter);
      setViewMode("chapter");
      setSelectedAct(null);
      if (selectedScene) {
        const sceneInChapter = chapter.scenes.some(
          (s) => s.id === selectedScene.id
        );
        if (!sceneInChapter) {
          setSelectedScene(null);
        }
      }
    },
    [selectedScene]
  );

  const handleActSelect = useCallback(
    (act: Act) => {
      setSelectedAct(act);
      setViewMode("act");
      setSelectedChapter(null);
      if (selectedScene) {
        const sceneInAct = act.chapters.some((chapter) =>
          chapter.scenes.some((scene) => scene.id === selectedScene.id)
        );
        if (!sceneInAct) {
          setSelectedScene(null);
        }
      }
    },
    [selectedScene]
  );

  // ===== ✨ FIXED: CREATE HANDLERS WITH PROPER STATE UPDATES =====

  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      if (!novelId) return;

      try {
        const requestBody = afterSceneId
          ? { insertAfterSceneId: afterSceneId }
          : {};

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
          console.log("✅ Scene created:", result.scene);

          // ✨ CRITICAL FIX: Reload the entire structure to get proper ordering
          await loadNovelStructure(novelId);

          // Alternative: If you prefer optimistic updates, use this instead:
          /*
        setNovel((prevNovel) => {
          if (!prevNovel) return prevNovel;

          return {
            ...prevNovel,
            acts: prevNovel.acts.map((act) => ({
              ...act,
              chapters: act.chapters.map((chapter) => {
                if (chapter.id === chapterId) {
                  const updatedScenes = [...chapter.scenes, result.scene];
                  updatedScenes.sort((a, b) => a.order - b.order);
                  return { ...chapter, scenes: updatedScenes };
                }
                return chapter;
              }),
            })),
          };
        });
        */
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
    [novelId, loadNovelStructure]
  );

  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      if (!novelId) return;

      try {
        const requestBody = afterChapterId
          ? { insertAfterChapterId: afterChapterId }
          : {};

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
          console.log("✅ Chapter created:", result.chapter);

          // ✨ CRITICAL FIX: Reload the entire structure to get proper ordering
          await loadNovelStructure(novelId);

          // Alternative: If you prefer optimistic updates, use this instead:
          /*
        setNovel((prevNovel) => {
          if (!prevNovel) return prevNovel;

          return {
            ...prevNovel,
            acts: prevNovel.acts.map((act) => {
              if (act.id === actId) {
                const updatedChapters = [...act.chapters, result.chapter];
                updatedChapters.sort((a, b) => a.order - b.order);
                return { ...act, chapters: updatedChapters };
              }
              return act;
            }),
          };
        });
        */
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
    [novelId, loadNovelStructure]
  );

  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!novelId) return;

      try {
        const requestBody = {
          title: title || "New Act",
          ...(insertAfterActId && { insertAfterActId }),
        };

        const response = await fetch(`/api/novels/${novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Act created:", result.act);

          // ✨ CRITICAL FIX: Reload the entire structure
          await loadNovelStructure(novelId);
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
    [novelId, loadNovelStructure]
  );

  // ===== DELETE HANDLERS =====

  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Scene deleted:", sceneId);

          // Clear selected scene if it was deleted
          if (selectedScene?.id === sceneId) {
            setSelectedScene(null);
          }

          // ✨ RELOAD: Ensure consistent state
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete scene");
          alert("Failed to delete scene. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting scene:", error);
        alert("Error deleting scene. Please try again.");
      }
    },
    [novelId, selectedScene, loadNovelStructure]
  );

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Chapter deleted:", chapterId);

          // Clear selected chapter if it was deleted
          if (selectedChapter?.id === chapterId) {
            setSelectedChapter(null);
          }

          // ✨ RELOAD: Ensure consistent state
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete chapter");
          alert("Failed to delete chapter. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Error deleting chapter. Please try again.");
      }
    },
    [novelId, selectedChapter, loadNovelStructure]
  );

  const handleDeleteAct = useCallback(
    async (actId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("✅ Act deleted:", actId);

          // Clear selected act if it was deleted
          if (selectedAct?.id === actId) {
            setSelectedAct(null);
          }

          // ✨ RELOAD: Ensure consistent state
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete act");
          alert("Failed to delete act. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting act:", error);
        alert("Error deleting act. Please try again.");
      }
    },
    [novelId, selectedAct, loadNovelStructure]
  );

  // ===== UPDATE HANDLERS (These work fine with optimistic updates) =====

  const handleUpdateActName = useCallback(
    async (actId: string, newTitle: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
          console.log("✅ Act name updated:", newTitle);

          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) =>
                act.id === actId ? { ...act, title: newTitle } : act
              ),
            };
          });
        } else {
          console.error("Failed to update act name");
          throw new Error("Failed to update act name");
        }
      } catch (error) {
        console.error("Error updating act name:", error);
        throw error;
      }
    },
    [novelId]
  );

  const handleUpdateChapterName = useCallback(
    async (chapterId: string, newTitle: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (response.ok) {
          console.log("✅ Chapter name updated:", newTitle);

          setNovel((prevNovel) => {
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
        } else {
          console.error("Failed to update chapter name");
          throw new Error("Failed to update chapter name");
        }
      } catch (error) {
        console.error("Error updating chapter name:", error);
        throw error;
      }
    },
    [novelId]
  );

  const handleUpdateSceneName = useCallback(
    async (sceneId: string, newTitle: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (response.ok) {
          console.log("✅ Scene name updated:", newTitle);

          setNovel((prevNovel) => {
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

          // Update selected scene if it's the one being renamed
          if (selectedScene?.id === sceneId) {
            setSelectedScene((prevScene) =>
              prevScene ? { ...prevScene, title: newTitle } : prevScene
            );
          }
        } else {
          console.error("Failed to update scene name");
          throw new Error("Failed to update scene name");
        }
      } catch (error) {
        console.error("Error updating scene name:", error);
        throw error;
      }
    },
    [novelId, selectedScene]
  );

  // ===== UTILITY FUNCTIONS =====

  const handleRefresh = useCallback(() => {
    console.log("🔄 EXPLICIT REFRESH: User action triggered refresh");
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  // ===== INITIALIZATION =====

  useEffect(() => {
    if (novelId) {
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]);

  // ===== COMPUTED VALUES =====

  const hasStructure = novel && novel.acts && novel.acts.length > 0;

  // ===== RETURN INTERFACE =====

  return {
    // State
    novel,
    loading,
    selectedScene,
    selectedChapter,
    selectedAct,
    viewMode,
    contentDisplayMode,

    // UI Actions
    setViewMode,
    setContentDisplayMode,
    handleViewModeChange,
    handleContentDisplayModeChange,

    // Selection Handlers
    handleSceneSelect,
    handleChapterSelect,
    handleActSelect,

    // CRUD Handlers
    handleAddScene,
    handleAddChapter,
    handleAddAct,
    handleDeleteScene,
    handleDeleteChapter,
    handleDeleteAct,

    // Update Handlers
    handleUpdateActName,
    handleUpdateChapterName,
    handleUpdateSceneName,

    // Utility
    handleRefresh,
    loadNovelStructure,
    hasStructure: !!hasStructure,
  };
}
