// src/app/test-import.tsx
// Simple test to verify the dialog works
"use client";

import React, { useState } from "react";
import { ContextualImportDialog } from "../components/manuscript/contextual-import";
import type { ImportContext } from "../components/manuscript/contextual-import";

const TestImport = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock context for testing
  const mockContext: ImportContext = {
    novelId: "test-123",
    viewMode: "scene",
    availableActs: [
      {
        id: "act1",
        title: "Act I: The Island",
        order: 1,
        chapters: [
          { id: "ch1", title: "Chapter 1", order: 1 },
          { id: "ch2", title: "Chapter 2", order: 2 },
        ],
      },
    ],
    currentAct: { id: "act1", title: "Act I: The Island", order: 1 },
    currentChapter: { id: "ch1", title: "Chapter 1", order: 1, actId: "act1" },
    currentScene: {
      id: "scene1",
      title: "Scene 1",
      order: 1,
      chapterId: "ch1",
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-2xl mb-4">Test Contextual Import</h1>

      <button
        onClick={() => setDialogOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Open Import Dialog
      </button>

      <ContextualImportDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        context={mockContext}
        onImportSuccess={() => {
          alert("Import success!");
          setDialogOpen(false);
        }}
      />
    </div>
  );
};

export default TestImport;
