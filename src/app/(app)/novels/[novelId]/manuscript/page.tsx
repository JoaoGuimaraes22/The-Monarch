// src/app/(app)/novels/[novelId]/manuscript/page.tsx
// ✨ UPDATED: Added auto-save functionality props

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ManuscriptEmptyState,
  DocxUploader,
} from "@/app/components/manuscript/import-system/";
import { ManuscriptEditor } from "@/app/components/manuscript/manuscript-editor";
import { useManuscriptLogic } from "@/hooks/manuscript/useManuscriptLogic";
import { useSidebar } from "@/app/components/workspace/sidebar-context";

interface ManuscriptPageProps {
  params: Promise<{
    novelId: string;
  }>;
}

export default function ManuscriptPage({ params }: ManuscriptPageProps) {
  const [novelId, setNovelId] = useState<string>("");
  const [showUploader, setShowUploader] = useState(false);

  // Get main sidebar state from context
  const { isMainSidebarCollapsed } = useSidebar();

  // ✨ ALL MANUSCRIPT LOGIC IN CUSTOM HOOK - Now with auto-save!
  const manuscript = useManuscriptLogic(novelId);

  // ===== COMPONENT-SPECIFIC LOGIC (Only UI and routing) =====

  // Await params and extract novelId
  useEffect(() => {
    params.then(({ novelId }) => {
      setNovelId(novelId);
    });
  }, [params]);

  // Handle import success
  const handleImportSuccess = useCallback(() => {
    setShowUploader(false);
    manuscript.loadNovelStructure(novelId);
  }, [manuscript, novelId]);

  // Handle start writing manually
  const handleStartWriting = useCallback(() => {
    console.log("Start writing manually");
  }, []);

  // ===== RENDER LOGIC (Simple and clean) =====

  // Loading state
  if (!novelId || manuscript.loading) {
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
  if (!manuscript.hasStructure) {
    return (
      <ManuscriptEmptyState
        onShowUploader={() => setShowUploader(true)}
        onStartWriting={handleStartWriting}
      />
    );
  }

  // ✨ UPDATED: Main manuscript editor with auto-save functionality
  return (
    <ManuscriptEditor
      novel={manuscript.novel!}
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
      // ✨ UPDATED: Complete auto-save functionality
      onSceneContentChange={manuscript.handleSceneContentChange}
      isSavingContent={manuscript.isSavingContent}
      lastSaved={manuscript.lastSaved}
      autoSaveEnabled={manuscript.autoSaveEnabled}
      setAutoSaveEnabled={manuscript.setAutoSaveEnabled}
      handleManualSave={manuscript.handleManualSave}
      pendingChanges={manuscript.pendingChanges}
      isMainSidebarCollapsed={isMainSidebarCollapsed}
    />
  );
}
