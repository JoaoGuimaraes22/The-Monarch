// src/app/components/manuscript/contextual-import/contextual-import-dialog.tsx
// ✨ UPDATED: Real API integration with working ADD modes

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Target,
  ChevronRight,
  ChevronLeft,
  X,
  Crown,
  BookOpen,
  FileEdit,
  AlertCircle,
  CheckCircle,
  ArrowDown,
  Plus,
} from "lucide-react";
import { ImportContext, ImportTarget } from "./types";
import {
  getTargetDisplayText,
  getChaptersForAct,
  getScenesForChapter,
  getAvailablePositions,
  validateImportFile,
} from "./utils";
import { useContextualImport } from "@/hooks/manuscript/useContextualImport";

interface ContextualImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: ImportContext;
  onImportSuccess: () => void;
}

type ImportStep =
  | "mode-selection"
  | "act-selection"
  | "chapter-selection"
  | "position-selection"
  | "file-upload"
  | "importing";

const ContextualImportDialog: React.FC<ContextualImportDialogProps> = ({
  isOpen,
  onClose,
  context,
  onImportSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>("mode-selection");
  const [selectedTarget, setSelectedTarget] = useState<ImportTarget | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the contextual import hook
  const { performImport, isImporting, error, clearError } = useContextualImport(
    {
      novelId: context.novelId,
      onImportSuccess,
    }
  );

  if (!isOpen) return null;

  const resetDialog = () => {
    setCurrentStep("mode-selection");
    setSelectedTarget(null);
    setSelectedFile(null);
    setDragOver(false);
    clearError();
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleModeSelect = (mode: ImportTarget["mode"]) => {
    const target: ImportTarget = {
      mode,
      position: "beginning", // Default position
    };
    setSelectedTarget(target);

    // Navigate to next step based on mode
    if (mode === "new-act") {
      setCurrentStep("position-selection");
    } else if (mode === "new-chapter") {
      setCurrentStep("act-selection");
    } else if (mode === "new-scene") {
      setCurrentStep("act-selection");
    }
  };

  const handleActSelect = (actId: string) => {
    if (!selectedTarget) return;

    const updatedTarget = { ...selectedTarget, targetActId: actId };
    setSelectedTarget(updatedTarget);

    if (selectedTarget.mode === "new-chapter") {
      setCurrentStep("position-selection");
    } else if (selectedTarget.mode === "new-scene") {
      setCurrentStep("chapter-selection");
    }
  };

  const handleChapterSelect = (chapterId: string) => {
    if (!selectedTarget) return;

    const updatedTarget = { ...selectedTarget, targetChapterId: chapterId };
    setSelectedTarget(updatedTarget);
    setCurrentStep("position-selection");
  };

  const handlePositionSelect = (
    position: "beginning" | "end" | "specific",
    specificPosition?: number
  ) => {
    if (!selectedTarget) return;

    const updatedTarget = {
      ...selectedTarget,
      position,
      specificPosition: position === "specific" ? specificPosition : undefined,
    };
    setSelectedTarget(updatedTarget);
    setCurrentStep("file-upload");
  };

  const handleFileSelect = (file: File) => {
    const validation = validateImportFile(file);
    if (!validation.isValid) {
      alert(`File validation failed: ${validation.errors.join(", ")}`);
      return;
    }

    setSelectedFile(file);
    // Start import immediately after file selection
    handleImport(file);
  };

  const handleImport = async (file: File) => {
    if (!selectedTarget) return;

    setCurrentStep("importing");

    try {
      await performImport(selectedTarget, file, false);
      // Success is handled by the hook calling onImportSuccess
    } catch (err) {
      // Error is handled by the hook setting error state
      console.error("Import failed:", err);
    }
  };

  // File upload handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Step 1: Mode Selection
  const ModeSelection = () => {
    const modes = [
      {
        id: "new-act" as const,
        icon: Crown,
        title: "Add New Act",
        description: "Import as a brand new act in your novel",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
      },
      {
        id: "new-chapter" as const,
        icon: BookOpen,
        title: "Add New Chapter",
        description: "Import as a new chapter in a specific act",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      },
      {
        id: "new-scene" as const,
        icon: FileEdit,
        title: "Add New Scene",
        description: "Import as new scenes in a specific chapter",
        color: "text-green-400",
        bgColor: "bg-green-500/10 hover:bg-green-500/20",
      },
    ];

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Import Document
          </h2>
          <p className="text-gray-300 text-sm">
            Choose how to import your document into{" "}
            <span className="text-red-400">{context.novelTitle}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`p-4 rounded-lg border border-gray-600 ${mode.bgColor} text-left transition-all hover:border-gray-500`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${mode.color}`} />
                  <div>
                    <h3 className="font-medium text-white">{mode.title}</h3>
                    <p className="text-sm text-gray-400">{mode.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 2: Act Selection (for new-chapter and new-scene)
  const ActSelection = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Select Target Act
          </h2>
          <p className="text-gray-300 text-sm">
            Choose which act to add the new{" "}
            {selectedTarget?.mode === "new-chapter" ? "chapter" : "scenes"} to
          </p>
        </div>

        <div className="space-y-2">
          {context.availableActs.map((act) => (
            <button
              key={act.id}
              onClick={() => handleActSelect(act.id)}
              className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {getTargetDisplayText("act", act)}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentStep("mode-selection")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to mode selection</span>
        </button>
      </div>
    );
  };

  // Step 3: Chapter Selection (for new-scene)
  const ChapterSelection = () => {
    const chapters = selectedTarget?.targetActId
      ? getChaptersForAct(context, selectedTarget.targetActId)
      : [];

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Select Target Chapter
          </h2>
          <p className="text-gray-300 text-sm">
            Choose which chapter to add the new scenes to
          </p>
        </div>

        <div className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter.id)}
              className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {getTargetDisplayText("chapter", chapter)}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentStep("act-selection")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to act selection</span>
        </button>
      </div>
    );
  };

  // Step 4: Position Selection
  const PositionSelection = () => {
    // Get existing items for position calculation
    let existingItems: Array<{ order: number }> = [];
    let itemType = "item";

    if (selectedTarget?.mode === "new-act") {
      existingItems = context.availableActs;
      itemType = "act";
    } else if (
      selectedTarget?.mode === "new-chapter" &&
      selectedTarget.targetActId
    ) {
      const act = context.availableActs.find(
        (a) => a.id === selectedTarget.targetActId
      );
      existingItems = act?.chapters || [];
      itemType = "chapter";
    } else if (
      selectedTarget?.mode === "new-scene" &&
      selectedTarget.targetChapterId
    ) {
      const chapters = context.availableActs.flatMap((a) => a.chapters);
      const chapter = chapters.find(
        (c) => c.id === selectedTarget.targetChapterId
      );
      existingItems = chapter?.scenes || [];
      itemType = "scene";
    }

    const positions = getAvailablePositions(existingItems);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Choose Position
          </h2>
          <p className="text-gray-300 text-sm">
            Where should the new {itemType} be placed?
          </p>
        </div>

        <div className="space-y-2">
          {positions.map((position) => (
            <button
              key={position.value}
              onClick={() =>
                handlePositionSelect(
                  position.label === "Beginning"
                    ? "beginning"
                    : position.label === "End"
                    ? "end"
                    : "specific",
                  position.value
                )
              }
              className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">
                    {position.label}
                  </span>
                  {position.description && (
                    <p className="text-sm text-gray-400">
                      {position.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (selectedTarget?.mode === "new-act") {
              setCurrentStep("mode-selection");
            } else if (selectedTarget?.mode === "new-chapter") {
              setCurrentStep("act-selection");
            } else if (selectedTarget?.mode === "new-scene") {
              setCurrentStep("chapter-selection");
            }
          }}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    );
  };

  // Step 5: File Upload
  const FileUpload = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Upload Document
          </h2>
          <p className="text-gray-300 text-sm">
            Select your .docx file to import
          </p>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? "border-red-500 bg-red-500/10"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">
            Drop your .docx file here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-red-400 hover:text-red-300 underline"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <button
          onClick={() => setCurrentStep("position-selection")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to position</span>
        </button>
      </div>
    );
  };

  // Step 6: Importing
  const Importing = () => {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-semibold text-white">Importing Document</h2>
        <p className="text-gray-300">
          Processing and integrating your content...
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mt-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Import Failed</span>
            </div>
            <p className="text-red-300 text-sm mt-2">{error}</p>
            <button
              onClick={() => setCurrentStep("file-upload")}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "mode-selection":
        return <ModeSelection />;
      case "act-selection":
        return <ActSelection />;
      case "chapter-selection":
        return <ChapterSelection />;
      case "position-selection":
        return <PositionSelection />;
      case "file-upload":
        return <FileUpload />;
      case "importing":
        return <Importing />;
      default:
        return <ModeSelection />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-red-500" />
            <h1 className="text-lg font-semibold text-white">Smart Import</h1>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={isImporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{renderCurrentStep()}</div>
      </div>
    </div>
  );
};

export default ContextualImportDialog;
