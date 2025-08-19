"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { Alert } from "@/app/components/ui";
import { useNovels } from "@/hooks/novels/useNovels";
import { CreateNovelData } from "@/lib/novels";

// Import feature components
import { PageHeader } from "@/app/components/novel-selection-page/page-header";
import { CreateNovelForm } from "@/app/components/novel-selection-page/create-novel-form";
import { NovelsGrid } from "@/app/components/novel-selection-page/novels-grid";

export default function NovelsPage() {
  const { novels, loading, error, createNovel, deleteNovel } = useNovels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateNovel = async (data: CreateNovelData) => {
    setIsSubmitting(true);
    try {
      await createNovel(data);
      setShowCreateForm(false);
    } catch (err) {
      // Error is already handled by the hook
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNovel = async (novelId: string) => {
    try {
      await deleteNovel(novelId);
    } catch (err) {
      // Error is already handled by the hook
      console.error("Failed to delete novel:", err);
    }
  };

  const handleEnterWorkspace = (novelId: string) => {
    // Navigate to novel workspace dashboard
    window.location.href = `/novels/${novelId}/dashboard`;
  };

  if (loading && novels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-red-600 mx-auto mb-4 animate-pulse" />
          <p className="text-white">Loading your novels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader onCreateClick={() => setShowCreateForm(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert type="error" title="Error" dismissible className="mb-6">
            {error}
          </Alert>
        )}

        {showCreateForm && (
          <CreateNovelForm
            onSubmit={handleCreateNovel}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isSubmitting}
          />
        )}

        <NovelsGrid
          novels={novels}
          onEnterWorkspace={handleEnterWorkspace}
          onCreateClick={() => setShowCreateForm(true)}
          onDeleteNovel={handleDeleteNovel}
        />
      </div>
    </div>
  );
}
