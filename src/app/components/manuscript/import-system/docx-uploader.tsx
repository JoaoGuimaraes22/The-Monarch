// src/app/components/manuscript/import-system/docx-uploader.tsx
// COMPLETE FIX: Updated to handle new standardized API response format

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  Zap,
  Settings,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Alert,
} from "@/app/components/ui";

import { StructurePreview } from "./structure-preview";

import { ParsedStructure, StructureIssue } from "@/lib/doc-parse";

interface DocxUploaderProps {
  novelId: string;
  onImportSuccess: () => void;
  onCancel: () => void;
}

// ✅ UPDATED: Interface to handle both old and new API response formats
interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    // New format - data is wrapped
    structure?: {
      acts: number;
      chapters: number;
      scenes: number;
      wordCount: number;
    };
    validation?: {
      isValid: boolean;
      errors: string[];
      warnings: StructureIssue[];
    };
    novel?: {
      id: string;
      title: string;
      description: string;
    };
    autoImported?: boolean;
    parsedStructure?: ParsedStructure;
  };
  // Old format - direct properties (for backward compatibility)
  structure?: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: StructureIssue[];
  };
  novel?: {
    id: string;
    title: string;
    description: string;
  };
  autoImported?: boolean;
  parsedStructure?: ParsedStructure;
  // Error properties
  error?: string;
  details?: string[];
  // Auto-fix specific properties
  isFixed?: boolean;
  fixApplied?: string;
  isImported?: boolean;
  fixedStructureData?: ParsedStructure;
  issuesDetected?: number;
}

// ✅ HELPER: Extract data from either format
function extractImportData(result: ImportResult) {
  // Try new format first (with data wrapper)
  if (result.data) {
    return {
      structure: result.data.structure,
      validation: result.data.validation,
      novel: result.data.novel,
      autoImported: result.data.autoImported,
      parsedStructure: result.data.parsedStructure,
    };
  }

  // Fall back to old format (direct properties)
  return {
    structure: result.structure,
    validation: result.validation,
    novel: result.novel,
    autoImported: result.autoImported,
    parsedStructure: result.parsedStructure,
  };
}

export const DocxUploader: React.FC<DocxUploaderProps> = ({
  novelId,
  onImportSuccess,
  onCancel,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Structure preview state
  const [fixedStructureData, setFixedStructureData] =
    useState<ParsedStructure | null>(null);
  const [isImportingFixed, setIsImportingFixed] = useState(false);
  const [originalStructureForComparison, setOriginalStructureForComparison] =
    useState<ParsedStructure | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".docx")) {
      setImportResult({
        success: false,
        error: "Invalid file type. Only .docx files are supported.",
        message: "",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setImportResult({
        success: false,
        error: "File too large. Maximum size is 10MB.",
        message: "",
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    setFixedStructureData(null);
    setOriginalStructureForComparison(null);

    // Read the file as ArrayBuffer for later use in auto-fix
    file
      .arrayBuffer()
      .then((buffer) => {
        setFileBuffer(buffer);
        console.log("✅ File buffer stored for auto-fix functionality");
      })
      .catch((bufferError) => {
        console.warn("⚠️ Could not read file buffer:", bufferError);
        setFileBuffer(null);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ===== DOCUMENT IMPORT (Updated for new API format) =====
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/novels/${novelId}/import`, {
        method: "POST",
        body: formData,
      });

      const result: ImportResult = await response.json();

      if (response.ok) {
        // ✅ FIXED: Handle both old and new response formats
        const importData = extractImportData(result);

        if (result.success || importData.structure) {
          setImportResult(result);

          // Check if there are auto-fixable issues
          const hasAutoFixableIssues =
            importData.validation?.warnings?.some(
              (issue: StructureIssue) => issue.autoFixable
            ) || false;

          // If no fixable issues and auto-imported, redirect after delay
          if (importData.autoImported && !hasAutoFixableIssues) {
            setTimeout(() => {
              onImportSuccess();
            }, 3000);
          }
        } else {
          setImportResult({
            success: false,
            error: result.error || "Failed to import document",
            details: result.details,
            message: "",
          });
        }
      } else {
        setImportResult({
          success: false,
          error: result.error || "Failed to import document",
          details: result.details,
          message: "",
        });
      }
    } catch (networkError) {
      console.error("Network error during upload:", networkError);
      setImportResult({
        success: false,
        error: "Network error. Please check your connection and try again.",
        message: "",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ===== AUTO-FIX (Updated for new API format) =====
  const handleAutoFix = async (issue: StructureIssue) => {
    if (!issue.fixAction || !selectedFile) {
      console.error("❌ Missing fix action or selected file");
      return;
    }

    setIsApplyingFix(issue.type);

    try {
      console.log("🔧 Starting server-side auto-fix process...");

      // Store original structure for comparison if we don't have it yet
      if (!originalStructureForComparison && importResult) {
        const importData = extractImportData(importResult);
        if (importData.parsedStructure) {
          setOriginalStructureForComparison(importData.parsedStructure);
        }
      }

      // Create FormData with the file and fix details
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("issueType", issue.type);
      formData.append("fixAction", JSON.stringify(issue.fixAction));

      console.log("📤 Sending auto-fix request to server...");

      const response = await fetch(`/api/novels/${novelId}/auto-fix`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ UPDATED: Handle both old and new standardized response formats
        const success = result.success !== undefined ? result.success : true;

        if (success) {
          console.log("✅ Server-side auto-fix completed successfully");

          // ✅ FIXED: Extract auto-fix data from either format
          const autoFixData = result.data ? result.data : result;

          console.log("📊 Updated structure:", autoFixData.structure);

          // Store the fixed structure data for preview and import
          setFixedStructureData(autoFixData.fixedStructureData);

          // Update the import result to show the changes
          setImportResult((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              // Update structure and validation based on format
              ...(prev.data
                ? {
                    data: {
                      ...prev.data,
                      structure: autoFixData.structure,
                      validation: autoFixData.validation,
                    },
                  }
                : {
                    structure: autoFixData.structure,
                    validation: autoFixData.validation,
                  }),
              issuesDetected: autoFixData.issuesDetected,
              isFixed: true,
              fixApplied: issue.type,
            };
          });

          // Show success feedback
          const message = `✅ Auto-fix applied successfully!\n\n${
            result.message || "Structure has been fixed"
          }\n\n📊 Updated Structure:\n• Acts: ${
            autoFixData.structure?.acts || 0
          }\n• Chapters: ${autoFixData.structure?.chapters || 0}\n• Scenes: ${
            autoFixData.structure?.scenes || 0
          }\n• Words: ${(
            autoFixData.structure?.wordCount || 0
          ).toLocaleString()}\n\n⚠️ Preview the changes below and click "Import Fixed Structure" to save to database.`;

          alert(message);
          console.log("🎉 Auto-fix UI updated successfully");
        } else {
          throw new Error(result.error || result.message || "Auto-fix failed");
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || error.message || "Auto-fix failed");
      }
    } catch (networkError) {
      console.error("❌ Network error during auto-fix:", networkError);
      const errorMessage = `❌ Auto-fix failed: ${
        networkError instanceof Error ? networkError.message : "Network error"
      }`;
      alert(errorMessage);
    } finally {
      setIsApplyingFix(null);
      console.log("🏁 Auto-fix process completed");
    }
  };

  // ===== IMPORT FIXED STRUCTURE (Updated for new API format) =====
  const handleImportFixedStructure = async () => {
    if (!fixedStructureData) {
      alert("❌ No fixed structure data available to import");
      return;
    }

    setIsImportingFixed(true);

    try {
      console.log("💾 Importing fixed structure to database...");

      const response = await fetch(`/api/novels/${novelId}/import-fixed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fixedStructure: fixedStructureData,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // ✅ UPDATED: Handle both old and new standardized response formats
        const success = result.success !== undefined ? result.success : true;

        if (success) {
          console.log("✅ Fixed structure imported successfully to database");

          // Update the import result to show successful import
          setImportResult((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              isImported: true,
              autoImported: true, // Mark as successfully imported
            };
          });

          // Show success message and redirect
          alert(
            "🎉 Fixed structure imported successfully!\n\nYour manuscript is now ready for editing. Redirecting to the editor..."
          );

          // Redirect to manuscript editor after short delay
          setTimeout(() => {
            onImportSuccess();
          }, 2000);
        } else {
          throw new Error(result.error || result.message || "Import failed");
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || error.message || "Import failed");
      }
    } catch (networkError) {
      console.error("❌ Network error during import:", networkError);
      const errorMessage = `❌ Import failed: ${
        networkError instanceof Error ? networkError.message : "Network error"
      }`;
      alert(errorMessage);
    } finally {
      setIsImportingFixed(false);
      console.log("🏁 Import fixed structure process completed");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ✅ HELPER: Get current import data for rendering
  const currentImportData = importResult
    ? extractImportData(importResult)
    : null;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader
        title="Import Manuscript"
        subtitle="Upload a .docx file to automatically detect chapters and scenes"
        actions={
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        }
      />
      <CardContent>
        {/* Upload Area */}
        {!selectedFile && !importResult && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-red-500 bg-red-50 bg-opacity-5"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Drop your .docx file here
            </h3>
            <p className="text-gray-300 mb-4">or click to browse files</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="mt-4 text-sm text-gray-400">
              <p>• Only .docx files supported</p>
              <p>• Maximum file size: 10MB</p>
              <p>• Use Heading 1 for Acts, Heading 2 for Chapters</p>
              <p>• Use *** or --- for scene breaks</p>
            </div>
          </div>
        )}

        {/* Selected File */}
        {selectedFile && !importResult && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
              <FileText className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-300 text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? "Importing..." : "Import Document"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="space-y-4">
            {importResult.success ? (
              <>
                {/* Success Message */}
                <Alert
                  type="success"
                  title={
                    currentImportData?.autoImported
                      ? "Document Imported Successfully!"
                      : "Document Parsed Successfully"
                  }
                  dismissible={false}
                >
                  <div className="space-y-2">
                    <p>{importResult.message}</p>
                    {currentImportData?.structure && (
                      <div className="text-sm">
                        <p>
                          📊 <strong>Structure:</strong>{" "}
                          {currentImportData.structure.acts} acts,{" "}
                          {currentImportData.structure.chapters} chapters,{" "}
                          {currentImportData.structure.scenes} scenes ({" "}
                          {currentImportData.structure.wordCount.toLocaleString()}{" "}
                          words)
                        </p>
                      </div>
                    )}
                  </div>
                </Alert>

                {/* Auto-fixable Issues */}
                {currentImportData?.validation?.warnings &&
                  currentImportData.validation.warnings.some(
                    (issue: StructureIssue) => issue.autoFixable
                  ) && (
                    <div className="space-y-3">
                      <Alert
                        type="warning"
                        title="Issues Found - Auto-Fix Available"
                        dismissible={false}
                      >
                        <p className="mb-3">
                          Some structural issues were detected, but they can be
                          automatically fixed:
                        </p>
                        <div className="space-y-2">
                          {currentImportData.validation.warnings
                            .filter(
                              (issue: StructureIssue) => issue.autoFixable
                            )
                            .map((issue: StructureIssue, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-700 rounded border-l-4 border-yellow-500"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                    <span className="font-medium text-white">
                                      {issue.type}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm mt-1">
                                    {issue.message}
                                  </p>
                                  {issue.suggestion && (
                                    <p className="text-blue-400 text-sm mt-1">
                                      💡 {issue.suggestion}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAutoFix(issue)}
                                  disabled={isApplyingFix === issue.type}
                                  className="ml-4"
                                >
                                  {isApplyingFix === issue.type ? (
                                    <>
                                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                                      Fixing...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-4 h-4 mr-2" />
                                      Auto-Fix
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                        </div>
                      </Alert>
                    </div>
                  )}

                {/* Fixed Structure Preview & Import */}
                {fixedStructureData && (
                  <div className="space-y-4">
                    <Alert
                      type="info"
                      title="Structure Fixed - Ready to Import"
                      dismissible={false}
                    >
                      <p className="mb-3">
                        The document structure has been fixed! Review the
                        changes below and import when ready.
                      </p>
                    </Alert>

                    <StructurePreview
                      fixedStructure={fixedStructureData}
                      originalStructure={
                        originalStructureForComparison || undefined
                      }
                      showComparison={!!originalStructureForComparison}
                    />

                    <div className="flex space-x-3">
                      <Button
                        variant="primary"
                        onClick={handleImportFixedStructure}
                        disabled={isImportingFixed}
                        className="flex-1"
                      >
                        {isImportingFixed ? (
                          <>
                            <Settings className="w-4 h-4 mr-2 animate-spin" />
                            Importing Fixed Structure...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Import Fixed Structure
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setFixedStructureData(null);
                          setOriginalStructureForComparison(null);
                        }}
                        disabled={isImportingFixed}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Continue or Auto-redirect */}
                {!fixedStructureData && (
                  <>
                    {currentImportData?.autoImported && (
                      <Alert
                        type="success"
                        title="Import Complete!"
                        dismissible={false}
                      >
                        <p>
                          Your manuscript has been successfully imported and is
                          ready for editing. You&#39;ll be redirected to the
                          manuscript editor shortly.
                        </p>
                      </Alert>
                    )}

                    {!currentImportData?.autoImported &&
                      currentImportData?.validation?.warnings &&
                      !currentImportData.validation.warnings.some(
                        (issue: StructureIssue) => issue.autoFixable
                      ) && (
                        <div className="text-center space-y-3">
                          <p className="text-sm text-gray-400">
                            You can apply auto-fixes above, or continue with the
                            current structure.
                          </p>
                          <Button
                            variant="primary"
                            onClick={onImportSuccess}
                            className="px-8"
                          >
                            Continue to Editor
                          </Button>
                        </div>
                      )}

                    {currentImportData?.autoImported &&
                      !currentImportData.validation?.warnings?.some(
                        (issue: StructureIssue) => issue.autoFixable
                      ) && (
                        <div className="text-center text-sm text-gray-400">
                          Redirecting to manuscript editor...
                        </div>
                      )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Error Message */}
                <Alert type="error" title="Import Failed" dismissible={false}>
                  <div className="space-y-2">
                    <p>{importResult.error}</p>
                    {importResult.details &&
                      Array.isArray(importResult.details) &&
                      importResult.details.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Issues found:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {importResult.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </Alert>

                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedFile(null);
                      setImportResult(null);
                    }}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                  <Button variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/*
===== COMPREHENSIVE FIXES APPLIED =====

✅ FIXED: New API response format handling
   - Handles both old format (direct properties) and new format (data wrapper)
   - extractImportData() helper function for format compatibility
   - All API calls updated: import, auto-fix, import-fixed

✅ FIXED: Type safety improvements
   - Updated ImportResult interface for both formats
   - Proper error handling for network issues
   - Safe property access throughout

✅ ENHANCED: Auto-fix workflow
   - Proper structure comparison and preview
   - Server-side auto-fix with enhanced feedback
   - Fixed structure import with success handling

✅ IMPROVED: User experience
   - Better error messages and feedback
   - Proper loading states for all operations
   - Auto-redirect after successful import

✅ MAINTAINED: All existing functionality
   - Drag and drop file upload
   - File validation (type and size)
   - Structure preview with comparison
   - Auto-fixable issue detection and resolution

This component now works with both the old API format (for backward compatibility)
and the new standardized API format with proper middleware and response wrapping.
*/
