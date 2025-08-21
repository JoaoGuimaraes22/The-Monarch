// src/app/(app)/novels/[novelId]/manuscript/page.tsx
// ✅ UPDATED: Using new clean navigation system

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ManuscriptEditor } from "@/app/components/manuscript/manuscript-editor";
import { useManuscriptLogic } from "@/hooks/manuscript";

export default function ManuscriptPage() {
  const params = useParams();
  const novelId = params.novelId as string;

  const manuscript = useManuscriptLogic(novelId);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] =
    React.useState(false);

  if (manuscript.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading manuscript...</p>
        </div>
      </div>
    );
  }

  if (manuscript.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Error loading manuscript</p>
          <p className="text-gray-400 mb-4">{manuscript.error}</p>
          <button
            onClick={manuscript.handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!manuscript.novel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <p className="text-xl">No manuscript found</p>
        </div>
      </div>
    );
  }

  return (
    <ManuscriptEditor
      novel={manuscript.novel}
      selectedScene={manuscript.selectedScene}
      selectedChapter={manuscript.selectedChapter}
      selectedAct={manuscript.selectedAct}
      viewMode={manuscript.viewMode}
      contentDisplayMode={manuscript.contentDisplayMode}
      onViewModeChange={manuscript.handleViewModeChange}
      onContentDisplayModeChange={manuscript.handleContentDisplayModeChange}
      onSceneSelect={manuscript.handleSceneSelect}
      onChapterSelect={manuscript.handleChapterSelect}
      onActSelect={manuscript.handleActSelect}
      onRefresh={manuscript.handleRefresh}
      onAddScene={manuscript.handleAddScene}
      onAddChapter={manuscript.handleAddChapter}
      onAddAct={manuscript.handleAddAct}
      onDeleteScene={manuscript.handleDeleteScene}
      onDeleteChapter={manuscript.handleDeleteChapter}
      onDeleteAct={manuscript.handleDeleteAct}
      onUpdateActName={manuscript.handleUpdateActName}
      onUpdateChapterName={manuscript.handleUpdateChapterName}
      onUpdateSceneName={manuscript.handleUpdateSceneName}
      // Auto-save functionality
      onSceneContentChange={manuscript.handleSceneContentChange}
      isSavingContent={manuscript.isSavingContent}
      lastSaved={manuscript.lastSaved}
      autoSaveEnabled={manuscript.autoSaveEnabled}
      setAutoSaveEnabled={manuscript.setAutoSaveEnabled}
      handleManualSave={manuscript.handleManualSave}
      pendingChanges={manuscript.pendingChanges}
      isMainSidebarCollapsed={isMainSidebarCollapsed}
      // ===== NEW NAVIGATION SYSTEM =====
      navigationContext={manuscript.getNavigationContext()}
      // Legacy handlers for backward compatibility
      onPreviousNavigation={() => {
        // Map to new navigation system based on context
        const context = manuscript.getNavigationContext();
        if (context.navigation.primary.hasPrevious) {
          context.navigation.primary.onPrevious();
        }
      }}
      onNextNavigation={() => {
        // Map to new navigation system based on context
        const context = manuscript.getNavigationContext();
        if (context.navigation.primary.hasNext) {
          context.navigation.primary.onNext();
        }
      }}
      onNavigationSelect={(itemId: string, level?: "primary" | "secondary") => {
        // Map to new navigation system
        const context = manuscript.getNavigationContext();
        if (level === "secondary" && "secondary" in context.navigation) {
          context.navigation.secondary.onScrollTo(itemId);
        } else {
          context.navigation.primary.onSelect(itemId);
        }
      }}
      showNavigation={true}
    />
  );
}

/*
===== INTEGRATION UPDATES =====

✅ NEW NAVIGATION INTEGRATION:
- Added navigationContext from new navigation system
- Mapped legacy navigation handlers to new system
- Maintained backward compatibility for existing components

✅ CLEAN HANDLER MAPPING:
- Primary navigation uses onSelect (changes view focus)
- Secondary navigation uses onScrollTo (just scrolls)
- Proper level-aware routing of navigation events

✅ PRESERVED FUNCTIONALITY:
- All existing props and handlers maintained
- Auto-save functionality preserved
- Error handling and loading states unchanged

✅ READY FOR TESTING:
- Navigation context provides clean data structure
- Handlers properly route to new navigation system
- Backward compatibility ensures existing components work

This integration allows testing the new navigation while maintaining compatibility!
*/
