"use client";

import React, { useEffect, useState } from "react";
import { WorkspaceLayout } from "@/app/components/workspace/workspace-layout";
import { useNovel } from "@/hooks/novels/useNovels";

interface NovelLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    novelId: string;
  }>;
}

export default function NovelLayout({ children, params }: NovelLayoutProps) {
  const [novelId, setNovelId] = useState<string>("");
  const { novel, loading } = useNovel(novelId);

  // Await params and extract novelId
  useEffect(() => {
    params.then(({ novelId }) => {
      setNovelId(novelId);
    });
  }, [params]);

  if (!novelId || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Novel Not Found
          </h1>
          <p className="text-gray-300 mb-4">
            The novel you&#39;re looking for doesn&#39;t exist.
          </p>
          <a href="/novels" className="text-red-500 hover:text-red-400">
            ← Back to Novels
          </a>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceLayout novelId={novelId} novelTitle={novel.title}>
      {children}
    </WorkspaceLayout>
  );
}
