"use client";

import React, { useEffect, useState } from "react";
import { DashboardPage } from "@/app/components/workspace/dashboard-page";
import { useNovel } from "@/hooks/useNovels";

interface DashboardRouteProps {
  params: Promise<{
    novelId: string;
  }>;
}

export default function DashboardRoute({ params }: DashboardRouteProps) {
  const [novelId, setNovelId] = useState<string>("");
  const { novel, loading } = useNovel(novelId);

  // Await params and extract novelId
  useEffect(() => {
    params.then(({ novelId }) => {
      setNovelId(novelId);
    });
  }, [params]);

  if (!novelId || loading || !novel) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return <DashboardPage novelTitle={novel.title} />;
}
