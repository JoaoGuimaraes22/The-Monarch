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
  Replace,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Types for complete contextual import
interface ImportContext {
  novelId: string;
  novelTitle: string;
  availableActs: Array<{
    id: string;
    title: string;
    order: number;
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      scenes: Array<{
        id: string;
        title: string;
        order: number;
      }>;
    }>;
  }>;
}

interface ImportTarget {
  mode:
    | "new-act"
    | "new-chapter"
    | "new-scene"
    | "replace-act"
    | "replace-chapter"
    | "replace-scene";
  targetActId?: string;
  targetChapterId?: string;
  targetSceneId?: string;
  position: "beginning" | "end" | "specific" | "replace";
  specificPosition?: number;
}

interface CompleteImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: ImportContext;
  onImportSuccess: () => void;
}

type ImportStep =
  | "mode-selection"
  | "act-selection"
  | "chapter-selection"
  | "scene-selection"
  | "position-selection"
  | "file-upload"
  | "preview"
  | "importing";

const CompleteContextualImportDialog: React.FC<CompleteImportDialogProps> = ({
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

  if (!isOpen) return null;

  const resetDialog = () => {
    setCurrentStep("mode-selection");
    setSelectedTarget(null);
    setSelectedFile(null);
    setDragOver(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  // Step 1: Mode Selection
  const ModeSelection = () => {
    const modes = [
      {
        id: "new-act",
        icon: Crown,
        title: "Add New Act",
        description: "Import as a brand new act in your novel",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
      },
      {
        id: "new-chapter",
        icon: BookOpen,
        title: "Add New Chapter",
        description: "Import as a new chapter in a specific act",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      },
      {
        id: "new-scene",
        icon: FileEdit,
        title: "Add New Scene",
        description: "Import as new scenes in a specific chapter",
        color: "text-green-400",
        bgColor: "bg-green-500/10 hover:bg-green-500/20",
      },
      {
        id: "replace-act",
        icon: Replace,
        title: "Replace Act",
        description: "Replace an entire act with imported content",
        color: "text-red-400",
        bgColor: "bg-red-500/10 hover:bg-red-500/20",
      },
      {
        id: "replace-chapter",
        icon: Replace,
        title: "Replace Chapter",
        description: "Replace a specific chapter with imported content",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
      },
      {
        id: "replace-scene",
        icon: Replace,
        title: "Replace Scene",
        description: "Replace a specific scene with imported content",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
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

        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => {
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedTarget({
                    mode: mode.id as ImportTarget["mode"],
                    position: "end",
                  });

                  // Determine next step based on mode
                  if (mode.id === "new-act") {
                    setCurrentStep("position-selection");
                  } else if (
                    mode.id === "new-chapter" ||
                    mode.id.startsWith("replace-")
                  ) {
                    setCurrentStep("act-selection");
                  } else if (mode.id === "new-scene") {
                    setCurrentStep("act-selection");
                  }
                }}
                className={`p-4 rounded-lg border text-left transition-all ${mode.bgColor} border-gray-600 border-opacity-50 hover:border-opacity-100`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    className={`w-6 h-6 ${mode.color} flex-shrink-0 mt-0.5`}
                  />
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {mode.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 2: Act Selection (for all modes except new-act)
  const ActSelection = () => {
    if (!selectedTarget) return null;

    const getTitle = () => {
      switch (selectedTarget.mode) {
        case "new-chapter":
          return "Choose Act for New Chapter";
        case "new-scene":
          return "Choose Act for New Scene";
        case "replace-act":
          return "Choose Act to Replace";
        case "replace-chapter":
          return "Choose Act Containing Chapter";
        case "replace-scene":
          return "Choose Act Containing Scene";
        default:
          return "Choose Act";
      }
    };

    const handleActSelect = (actId: string) => {
      setSelectedTarget({ ...selectedTarget, targetActId: actId });

      // Determine next step
      if (selectedTarget.mode === "new-chapter") {
        setCurrentStep("position-selection");
      } else if (selectedTarget.mode === "replace-act") {
        setCurrentStep("file-upload");
      } else if (
        selectedTarget.mode === "new-scene" ||
        selectedTarget.mode === "replace-chapter" ||
        selectedTarget.mode === "replace-scene"
      ) {
        setCurrentStep("chapter-selection");
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-gray-300 text-sm">
            Select from {context.availableActs.length} available acts
          </p>
        </div>

        <div className="space-y-2">
          {context.availableActs.map((act) => (
            <button
              key={act.id}
              onClick={() => handleActSelect(act.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedTarget.targetActId === act.id
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        Act {act.order}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-white">{act.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {act.chapters.length} chapters
                    </p>
                  </div>
                </div>
                {selectedTarget.mode === "replace-act" && (
                  <div className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    Will Replace
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCurrentStep("mode-selection")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Chapter Selection (for scene modes and replace-chapter)
  const ChapterSelection = () => {
    if (!selectedTarget || !selectedTarget.targetActId) return null;

    const selectedAct = context.availableActs.find(
      (a) => a.id === selectedTarget.targetActId
    );
    if (!selectedAct) return null;

    const getTitle = () => {
      switch (selectedTarget.mode) {
        case "new-scene":
          return `Choose Chapter in "${selectedAct.title}" for New Scene`;
        case "replace-chapter":
          return `Choose Chapter in "${selectedAct.title}" to Replace`;
        case "replace-scene":
          return `Choose Chapter in "${selectedAct.title}" Containing Scene`;
        default:
          return "Choose Chapter";
      }
    };

    const handleChapterSelect = (chapterId: string) => {
      setSelectedTarget({ ...selectedTarget, targetChapterId: chapterId });

      // Determine next step
      if (selectedTarget.mode === "new-scene") {
        setCurrentStep("position-selection");
      } else if (selectedTarget.mode === "replace-chapter") {
        setCurrentStep("file-upload");
      } else if (selectedTarget.mode === "replace-scene") {
        setCurrentStep("scene-selection");
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-gray-300 text-sm">
            Select from {selectedAct.chapters.length} available chapters
          </p>
        </div>

        <div className="space-y-2">
          {selectedAct.chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedTarget.targetChapterId === chapter.id
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        Chapter {chapter.order}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-white">{chapter.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {chapter.scenes.length} scenes
                    </p>
                  </div>
                </div>
                {selectedTarget.mode === "replace-chapter" && (
                  <div className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    Will Replace
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCurrentStep("act-selection")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  };

  // Step 4: Scene Selection (for replace-scene only)
  const SceneSelection = () => {
    if (!selectedTarget || !selectedTarget.targetChapterId) return null;

    const selectedAct = context.availableActs.find(
      (a) => a.id === selectedTarget.targetActId
    );
    const selectedChapter = selectedAct?.chapters.find(
      (c) => c.id === selectedTarget.targetChapterId
    );
    if (!selectedChapter) return null;

    const handleSceneSelect = (sceneId: string) => {
      setSelectedTarget({
        ...selectedTarget,
        targetSceneId: sceneId,
        position: "replace",
      });
      setCurrentStep("file-upload");
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Choose Scene in &#34;{selectedChapter.title}&#34; to Replace
          </h2>
          <p className="text-gray-300 text-sm">
            Select from {selectedChapter.scenes.length} available scenes
          </p>
        </div>

        <div className="space-y-2">
          {selectedChapter.scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSceneSelect(scene.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedTarget.targetSceneId === scene.id
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileEdit className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        Scene {scene.order}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-white">
                        {scene.title || `Scene ${scene.order}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                  Will Replace
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCurrentStep("chapter-selection")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Position Selection (for all "new" modes)
  const PositionSelection = () => {
    if (!selectedTarget) return null;

    const getTargetInfo = () => {
      if (selectedTarget.mode === "new-act") {
        return {
          title: "Position New Act in Novel",
          itemType: "act",
          currentCount: context.availableActs.length,
        };
      } else if (selectedTarget.mode === "new-chapter") {
        const targetAct = context.availableActs.find(
          (a) => a.id === selectedTarget.targetActId
        );
        return {
          title: `Position New Chapter in "${targetAct?.title}"`,
          itemType: "chapter",
          currentCount: targetAct?.chapters.length || 0,
        };
      } else if (selectedTarget.mode === "new-scene") {
        const targetAct = context.availableActs.find(
          (a) => a.id === selectedTarget.targetActId
        );
        const targetChapter = targetAct?.chapters.find(
          (c) => c.id === selectedTarget.targetChapterId
        );
        return {
          title: `Position New Scene in "${targetChapter?.title}"`,
          itemType: "scene",
          currentCount: targetChapter?.scenes.length || 0,
        };
      }
      return null;
    };

    const targetInfo = getTargetInfo();
    if (!targetInfo) return null;

    const { title, itemType, currentCount } = targetInfo;

    const handleBack = () => {
      if (selectedTarget.mode === "new-act") {
        setCurrentStep("mode-selection");
      } else if (selectedTarget.mode === "new-chapter") {
        setCurrentStep("act-selection");
      } else if (selectedTarget.mode === "new-scene") {
        setCurrentStep("chapter-selection");
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-gray-300 text-sm">
            Choose where to place your new {itemType} ({currentCount} existing)
          </p>
        </div>

        <div className="space-y-3">
          {/* Beginning Option */}
          <button
            onClick={() =>
              setSelectedTarget({
                ...selectedTarget,
                position: "beginning",
              })
            }
            className={`w-full p-4 rounded-lg border text-left transition-all ${
              selectedTarget.position === "beginning"
                ? "border-red-500 bg-red-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ArrowUp className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Add at Beginning</h4>
                <p className="text-gray-400 text-sm">
                  Position 1 - becomes the first {itemType}
                </p>
              </div>
            </div>
          </button>

          {/* End Option */}
          <button
            onClick={() =>
              setSelectedTarget({
                ...selectedTarget,
                position: "end",
              })
            }
            className={`w-full p-4 rounded-lg border text-left transition-all ${
              selectedTarget.position === "end"
                ? "border-red-500 bg-red-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ArrowDown className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Add at End</h4>
                <p className="text-gray-400 text-sm">
                  Position {currentCount + 1} - becomes the last {itemType}
                </p>
              </div>
            </div>
          </button>

          {/* Specific Position Option */}
          {currentCount > 1 && (
            <button
              onClick={() =>
                setSelectedTarget({
                  ...selectedTarget,
                  position: "specific",
                  specificPosition: 2,
                })
              }
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedTarget.position === "specific"
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">
                    Choose Specific Position
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Insert between existing {itemType}s (bumps others up)
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Specific Position Selector */}
          {selectedTarget.position === "specific" && currentCount > 1 && (
            <div className="ml-8 p-4 bg-gray-700 rounded-lg">
              <h5 className="text-white font-medium mb-3">Select Position:</h5>
              <div className="space-y-2">
                {Array.from({ length: currentCount - 1 }, (_, i) => i + 2).map(
                  (position) => (
                    <button
                      key={position}
                      onClick={() =>
                        setSelectedTarget({
                          ...selectedTarget,
                          specificPosition: position,
                        })
                      }
                      className={`w-full p-2 rounded border text-left transition-all ${
                        selectedTarget.specificPosition === position
                          ? "border-red-500 bg-red-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">
                          Position {position}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Items {position}+ become {position + 1}+
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={() => setCurrentStep("file-upload")}
            disabled={
              !selectedTarget?.position ||
              (selectedTarget.position === "specific" &&
                !selectedTarget.specificPosition)
            }
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Placeholder components (same as before)
  const FileUpload = () => <div>File Upload Component</div>;
  const Preview = () => <div>Preview Component</div>;
  const Importing = () => <div>Importing Component</div>;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "mode-selection":
        return <ModeSelection />;
      case "act-selection":
        return <ActSelection />;
      case "chapter-selection":
        return <ChapterSelection />;
      case "scene-selection":
        return <SceneSelection />;
      case "position-selection":
        return <PositionSelection />;
      case "file-upload":
        return <FileUpload />;
      case "preview":
        return <Preview />;
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{renderCurrentStep()}</div>
      </div>
    </div>
  );
};

export default CompleteContextualImportDialog;
