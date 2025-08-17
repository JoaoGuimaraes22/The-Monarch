"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DocxUploader } from "@/app/components/manuscript/docx-uploader";
import { ManuscriptEmptyState } from "@/app/components/manuscript/manuscript-empty-state";
import { ManuscriptEditor } from "@/app/components/manuscript/manuscript-editor";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/view-mode-selector";
import { NovelWithStructure, Scene, Act, Chapter } from "@/lib/novels";
import { useSidebar } from "@/app/components/workspace/sidebar-context";

interface ManuscriptPageProps {
  params: Promise<{
    novelId: string;
  }>;
}

export default function ManuscriptPage({ params }: ManuscriptPageProps) {
  const [novelId, setNovelId] = useState<string>("");
  const [showUploader, setShowUploader] = useState(false);
  const [novel, setNovel] = useState<NovelWithStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("scene");
  const [contentDisplayMode, setContentDisplayMode] = useState<
    "document" | "grid"
  >("document");

  // Get main sidebar state from context
  const { isMainSidebarCollapsed } = useSidebar();

  // ✨ FIXED: Removed selectedScene dependency to prevent unnecessary API calls
  const loadNovelStructure = useCallback(
    async (id: string) => {
      console.log("🔄 API CALL: loadNovelStructure called");
      try {
        setLoading(true);
        const response = await fetch(`/api/novels/${id}/structure`);
        if (response.ok) {
          const novelData = await response.json();
          setNovel(novelData);

          // ✨ IMPROVED: Only auto-select if no scene is currently selected
          if (novelData.acts && novelData.acts.length > 0) {
            // Check if current selectedScene still exists in the new data
            let sceneStillExists = false;
            if (selectedScene) {
              sceneStillExists = novelData.acts?.some((act: Act) =>
                act.chapters?.some((chapter: Chapter) =>
                  chapter.scenes?.some(
                    (scene: Scene) => scene.id === selectedScene.id
                  )
                )
              );
            }

            // Only change selection if no scene is selected or current scene was deleted
            if (!selectedScene || !sceneStillExists) {
              const firstAct = novelData.acts[0];
              if (firstAct.chapters && firstAct.chapters.length > 0) {
                const firstChapter = firstAct.chapters[0];
                if (firstChapter.scenes && firstChapter.scenes.length > 0) {
                  setSelectedScene(firstChapter.scenes[0]);
                  setSelectedChapter(null);
                  setSelectedAct(null);
                  setViewMode("scene");
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
    [] // ✨ FIXED: Empty dependency array - function doesn't depend on state
  );

  // Await params and extract novelId
  useEffect(() => {
    params.then(({ novelId }) => {
      setNovelId(novelId);
      loadNovelStructure(novelId);
    });
  }, [params, loadNovelStructure]);

  const handleImportSuccess = useCallback(() => {
    setShowUploader(false);
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  const handleSceneSelect = useCallback((sceneId: string, scene: Scene) => {
    console.log("Parent: Scene selected, switching to scene view");
    setSelectedScene(scene);
    setSelectedChapter(null);
    setSelectedAct(null);
    setViewMode("scene");
  }, []);

  const handleChapterSelect = useCallback((chapter: Chapter) => {
    console.log("Parent: Chapter selected:", chapter.title);

    if (chapter.scenes.length > 0) {
      const firstScene = chapter.scenes.sort((a, b) => a.order - b.order)[0];
      setSelectedScene(firstScene);
    }
    setSelectedChapter(chapter);
    setSelectedAct(null);
    setViewMode("chapter");
  }, []);

  const handleActSelect = useCallback((act: Act) => {
    console.log("Parent: Act selected:", act.title);

    if (act.chapters.length > 0) {
      const firstChapter = act.chapters.sort((a, b) => a.order - b.order)[0];
      if (firstChapter.scenes.length > 0) {
        const firstScene = firstChapter.scenes.sort(
          (a, b) => a.order - b.order
        )[0];
        setSelectedScene(firstScene);
      }
    }
    setSelectedChapter(null);
    setSelectedAct(act);
    setViewMode("act");
  }, []);

  // ✨ Handle content display mode changes
  const handleContentDisplayModeChange = useCallback(
    (newMode: "document" | "grid") => {
      console.log("Parent: Content display mode changed to:", newMode);
      setContentDisplayMode(newMode);
    },
    []
  );

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      console.log("Parent: View mode changed to:", newViewMode);

      // ✨ ONLY reset to document view when switching to scene mode
      // For chapter/act modes, preserve the current display mode
      if (newViewMode === "scene") {
        setContentDisplayMode("document");
      }

      // ✨ When switching view modes, find and select the appropriate parent container
      if (selectedScene && novel) {
        if (newViewMode === "chapter") {
          // Find the chapter containing the current scene
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
          // Find the act containing the current scene
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
          // Switch back to scene view
          setSelectedChapter(null);
          setSelectedAct(null);
          setViewMode("scene");
          return;
        }
      }

      // Fallback: just change view mode if no scene is selected
      setViewMode(newViewMode);
    },
    [selectedScene, novel]
  );

  const handleStartWriting = useCallback(() => {
    console.log("Start writing manually");
  }, []);

  // ✨ SIMPLEST: Add scene directly to state
  const handleAddScene = useCallback(
    async (chapterId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}/scenes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Scene created:", result.scene);

          // ✨ DIRECT: Update novel state immediately with new scene
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? { ...chapter, scenes: [...chapter.scenes, result.scene] }
                    : chapter
                ),
              })),
            };
          });
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
    [novelId]
  );

  // ✨ SIMPLEST: Add chapter directly to state
  const handleAddChapter = useCallback(
    async (actId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(
          `/api/novels/${novelId}/acts/${actId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Chapter created:", result.chapter);

          // ✨ DIRECT: Update novel state immediately with new chapter
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) =>
                act.id === actId
                  ? { ...act, chapters: [...act.chapters, result.chapter] }
                  : act
              ),
            };
          });
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
    [novelId]
  );

  // ✨ SIMPLE: Delete scene directly from state
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

          // ✨ DIRECT: Remove scene from novel state immediately
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) => ({
                  ...chapter,
                  scenes: chapter.scenes.filter(
                    (scene) => scene.id !== sceneId
                  ),
                })),
              })),
            };
          });

          // ✨ Clear selection if deleted scene was selected
          if (selectedScene?.id === sceneId) {
            setSelectedScene(null);
          }
        } else {
          console.error("Failed to delete scene");
          alert("Failed to delete scene");
        }
      } catch (error) {
        console.error("Error deleting scene:", error);
        alert("Error deleting scene. Please try again.");
      }
    },
    [novelId, selectedScene]
  );

  // ✨ SIMPLE: Delete chapter directly from state
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

          // ✨ DIRECT: Remove chapter from novel state immediately
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.filter(
                  (chapter) => chapter.id !== chapterId
                ),
              })),
            };
          });

          // ✨ Clear selection if deleted chapter was selected
          if (selectedChapter?.id === chapterId) {
            setSelectedChapter(null);
            setSelectedScene(null);
          }
        } else {
          console.error("Failed to delete chapter");
          alert("Failed to delete chapter");
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Error deleting chapter. Please try again.");
      }
    },
    [novelId, selectedChapter]
  );

  // ✨ SIMPLE: Delete act directly from state
  const handleDeleteAct = useCallback(
    async (actId: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("✅ Act deleted:", actId);

          // ✨ DIRECT: Remove act from novel state immediately
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.filter((act) => act.id !== actId),
            };
          });

          // ✨ Clear selection if deleted act was selected
          if (selectedAct?.id === actId) {
            setSelectedAct(null);
            setSelectedChapter(null);
            setSelectedScene(null);
          }
        } else {
          console.error("Failed to delete act");
          alert("Failed to delete act");
        }
      } catch (error) {
        console.error("Error deleting act:", error);
        alert("Error deleting act. Please try again.");
      }
    },
    [novelId, selectedAct]
  );

  // ✨ NEW: Name editing handlers with direct state updates
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

          // ✨ DIRECT: Update act name in state immediately
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

          // ✨ DIRECT: Update chapter name in state immediately
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

          // ✨ DIRECT: Update scene name in state immediately
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

          // ✨ Update selected scene if it's the one being renamed
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

  // ✨ SIMPLEST: Add act directly to state (following your exact pattern)
  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!novelId) return;

      try {
        const response = await fetch(`/api/novels/${novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            insertAfterActId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Act created:", result.act);

          // ✨ DIRECT: Update novel state immediately with new act
          setNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            const updatedActs = [...(prevNovel.acts || [])];

            if (insertAfterActId) {
              // Find insertion point and insert after the specified act
              const insertIndex = updatedActs.findIndex(
                (act) => act.id === insertAfterActId
              );
              if (insertIndex >= 0) {
                updatedActs.splice(insertIndex + 1, 0, result.act);
              } else {
                updatedActs.push(result.act);
              }
            } else {
              // Add at the end
              updatedActs.push(result.act);
            }

            return {
              ...prevNovel,
              acts: updatedActs,
            };
          });

          // Optionally, auto-select the new act
          setSelectedAct(result.act);
          setSelectedChapter(null);
          setSelectedScene(result.act.chapters?.[0]?.scenes?.[0] || null);
          setViewMode("act");
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
    [novelId]
  );

  // ✨ SIMPLE: Only refresh when explicitly needed (errors, imports, etc.)
  const handleRefresh = useCallback(() => {
    console.log("🔄 EXPLICIT REFRESH: User action triggered refresh");
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  // Loading state
  if (!novelId || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show uploader modal
  if (showUploader) {
    return (
      <div className="p-8">
        <DocxUploader
          novelId={novelId}
          onImportSuccess={handleImportSuccess}
          onCancel={() => setShowUploader(false)}
        />
      </div>
    );
  }

  // If no structure exists, show options to import or start manually
  const hasStructure = novel && novel.acts && novel.acts.length > 0;

  if (!hasStructure) {
    return (
      <ManuscriptEmptyState
        onShowUploader={() => setShowUploader(true)}
        onStartWriting={handleStartWriting}
      />
    );
  }

  // Show the three-panel manuscript manager
  return (
    <ManuscriptEditor
      novel={novel}
      selectedScene={selectedScene}
      selectedChapter={selectedChapter}
      selectedAct={selectedAct}
      viewMode={viewMode}
      contentDisplayMode={contentDisplayMode}
      onViewModeChange={handleViewModeChange}
      onContentDisplayModeChange={handleContentDisplayModeChange}
      onSceneSelect={handleSceneSelect}
      onChapterSelect={handleChapterSelect}
      onActSelect={handleActSelect}
      onRefresh={handleRefresh}
      onAddScene={handleAddScene}
      onAddChapter={handleAddChapter}
      onDeleteScene={handleDeleteScene}
      onDeleteChapter={handleDeleteChapter}
      onDeleteAct={handleDeleteAct}
      // ✨ NEW: Name editing handlers
      onUpdateActName={handleUpdateActName}
      onUpdateChapterName={handleUpdateChapterName}
      onUpdateSceneName={handleUpdateSceneName}
      isMainSidebarCollapsed={isMainSidebarCollapsed}
      onAddAct={handleAddAct}
    />
  );
}
