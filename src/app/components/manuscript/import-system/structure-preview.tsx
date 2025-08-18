// src/app/components/manuscript/structure-preview.tsx
// Component to show before/after structure comparison

import React from "react";
import { ParsedStructure } from "@/lib/doc-parse";
import { CheckCircle, ArrowRight, FileText, Book, Layers } from "lucide-react";

interface StructurePreviewProps {
  originalStructure?: ParsedStructure;
  fixedStructure: ParsedStructure;
  showComparison?: boolean;
}

export const StructurePreview: React.FC<StructurePreviewProps> = ({
  originalStructure,
  fixedStructure,
  showComparison = false,
}) => {
  const renderStructureTree = (
    structure: ParsedStructure,
    title: string,
    isFixed = false
  ) => (
    <div
      className={`p-4 rounded-lg border ${
        isFixed
          ? "bg-green-900/10 border-green-700"
          : "bg-gray-800 border-gray-600"
      }`}
    >
      <h4
        className={`font-semibold mb-3 flex items-center space-x-2 ${
          isFixed ? "text-green-300" : "text-gray-300"
        }`}
      >
        {isFixed && <CheckCircle className="w-4 h-4" />}
        <span>{title}</span>
      </h4>

      <div className="space-y-2 font-mono text-sm">
        {structure.acts.map((act, actIndex) => (
          <div key={actIndex} className="space-y-1">
            {/* Act */}
            <div className="flex items-center space-x-2 text-blue-300">
              <Layers className="w-3 h-3" />
              <span className="font-medium">ACT {act.order}:</span>
              <span className="text-blue-200 truncate max-w-xs">
                {act.title}
              </span>
              <span className="text-gray-400 text-xs">
                ({act.chapters.length} ch)
              </span>
            </div>

            {/* Chapters */}
            <div className="ml-4 space-y-1">
              {act.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="space-y-1">
                  {/* Chapter */}
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <Book className="w-3 h-3" />
                    <span className="font-medium">CH{chapter.order}:</span>
                    <span className="text-yellow-200 truncate max-w-sm">
                      {chapter.title}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({chapter.scenes.length} sc)
                    </span>
                  </div>

                  {/* Scenes */}
                  <div className="ml-4 flex items-center space-x-1 text-gray-300">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs">Scenes:</span>
                    {chapter.scenes.map((scene, sceneIndex) => (
                      <span
                        key={sceneIndex}
                        className="text-xs px-1 py-0.5 bg-gray-700 rounded"
                      >
                        SC{scene.order}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">
                      (
                      {chapter.scenes.reduce(
                        (sum, scene) => sum + scene.wordCount,
                        0
                      )}{" "}
                      words)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
        <div className="flex space-x-4">
          <span>{structure.acts.length} acts</span>
          <span>
            {structure.acts.reduce((sum, act) => sum + act.chapters.length, 0)}{" "}
            chapters
          </span>
          <span>
            {structure.acts.reduce(
              (sum, act) =>
                sum +
                act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
              0
            )}{" "}
            scenes
          </span>
          <span>{structure.wordCount.toLocaleString()} words</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {showComparison && originalStructure ? (
        // Before/After Comparison
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderStructureTree(originalStructure, "📄 Original Structure")}

          <div className="flex items-center justify-center lg:hidden">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          {renderStructureTree(fixedStructure, "✅ Fixed Structure", true)}
        </div>
      ) : (
        // Just Fixed Structure
        <div className="max-w-2xl">
          {renderStructureTree(
            fixedStructure,
            "✅ Fixed Structure Preview",
            true
          )}
        </div>
      )}

      {/* Changes Summary */}
      {showComparison && originalStructure && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <h5 className="font-medium text-blue-300 mb-2">
            🔄 Changes Applied:
          </h5>
          <div className="text-sm text-blue-200 space-y-1">
            {getChangeSummary(originalStructure, fixedStructure).map(
              (change, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>{change}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to detect changes between structures
function getChangeSummary(
  original: ParsedStructure,
  fixed: ParsedStructure
): string[] {
  const changes: string[] = [];

  // Compare chapter titles
  const originalTitles = original.acts.flatMap((act) =>
    act.chapters.map((ch) => ch.title)
  );
  const fixedTitles = fixed.acts.flatMap((act) =>
    act.chapters.map((ch) => ch.title)
  );

  let titleChanges = 0;
  for (let i = 0; i < originalTitles.length; i++) {
    if (originalTitles[i] !== fixedTitles[i]) {
      titleChanges++;
    }
  }

  if (titleChanges > 0) {
    changes.push(`Renumbered ${titleChanges} chapter titles`);
  }

  // Compare chapter orders
  const originalOrders = original.acts.flatMap((act) =>
    act.chapters.map((ch) => ch.order)
  );
  const fixedOrders = fixed.acts.flatMap((act) =>
    act.chapters.map((ch) => ch.order)
  );

  let orderChanges = 0;
  for (let i = 0; i < originalOrders.length; i++) {
    if (originalOrders[i] !== fixedOrders[i]) {
      orderChanges++;
    }
  }

  if (orderChanges > 0) {
    changes.push(`Fixed ${orderChanges} chapter order sequences`);
  }

  // Compare scene counts (for combine operations)
  const originalSceneCount = original.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );
  const fixedSceneCount = fixed.acts.reduce(
    (sum, act) =>
      sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
    0
  );

  if (originalSceneCount !== fixedSceneCount) {
    const diff = originalSceneCount - fixedSceneCount;
    changes.push(`Combined ${diff} short scenes`);
  }

  if (changes.length === 0) {
    changes.push("Structure validated and confirmed correct");
  }

  return changes;
}
