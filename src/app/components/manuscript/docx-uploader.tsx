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

import { DocumentAutoFixService } from "@/lib/document-auto-fix-service";
import {
  EnhancedDocxParser,
  ParsedStructure,
} from "@/lib/enhanced-docx-parser";

interface DocxUploaderProps {
  novelId: string;
  onImportSuccess: () => void;
  onCancel: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
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
  issuesDetected?: number;
  error?: string;
  details?: string[];
}

interface StructureIssue {
  type: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  autoFixable: boolean;
  fixAction?: {
    type:
      | "renumber_chapters"
      | "renumber_scenes"
      | "combine_scenes"
      | "split_scenes"
      | "rename_duplicate";
    description: string;
    targetId?: string;
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
  const [parsedStructure, setParsedStructure] =
    useState<ParsedStructure | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoFix = async (issue: StructureIssue) => {
    if (!issue.fixAction) return;

    setIsApplyingFix(issue.type);

    try {
      console.log("🔧 Starting auto-fix process...");

      // Check if we have the parsed structure
      if (!parsedStructure) {
        if (!fileBuffer) {
          alert(
            "❌ Cannot apply fix: Document buffer is not available. Please re-upload the document."
          );
          return;
        }

        try {
          console.log("📖 Parsing document from buffer for auto-fix...");
          const structure = await DocumentAutoFixService.parseFromBuffer(
            fileBuffer
          );
          setParsedStructure(structure);
          console.log("✅ Document structure parsed successfully");
        } catch (parseError) {
          console.error("❌ Failed to parse document:", parseError);
          alert(
            "❌ Cannot apply fix: Failed to parse document structure. Please try re-uploading the document."
          );
          return;
        }
      }

      // Step 2: Apply the specific fix
      console.log("🔧 Applying fix:", issue.fixAction.description);
      const fixResult = await DocumentAutoFixService.applyAutoFix(
        parsedStructure,
        issue
      );

      if (fixResult.success && fixResult.fixedStructure) {
        console.log("✅ Auto-fix completed successfully");

        // Step 3: Update our stored structure
        setParsedStructure(fixResult.fixedStructure);

        // Step 4: Re-validate the fixed structure to update the UI
        const newValidation = EnhancedDocxParser.validateStructure(
          fixResult.fixedStructure
        );

        // Step 5: Update the import result to show the changes
        setImportResult((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            structure: {
              acts: fixResult.fixedStructure!.acts.length,
              chapters: fixResult.fixedStructure!.acts.reduce(
                (sum, act) => sum + act.chapters.length,
                0
              ),
              scenes: fixResult.fixedStructure!.acts.reduce(
                (sum, act) =>
                  sum +
                  act.chapters.reduce(
                    (chSum, ch) => chSum + ch.scenes.length,
                    0
                  ),
                0
              ),
              wordCount: fixResult.fixedStructure!.wordCount,
            },
            validation: newValidation,
            issuesDetected: newValidation.warnings.length,
          };
        });

        // Step 6: Show success feedback
        alert(`✅ Auto-fix applied successfully!\n\n${fixResult.message}`);
      } else {
        console.error("❌ Auto-fix failed:", fixResult.error);
        alert(`❌ Auto-fix failed: ${fixResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error applying auto-fix:", error);
      alert("❌ Failed to apply auto-fix. Please try again.");
    } finally {
      setIsApplyingFix(null);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".docx")) {
      setImportResult({
        success: false,
        error: "Only .docx files are supported",
        message: "",
      });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
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
    setParsedStructure(null); // Clear any previous parsed structure

    // Read the file as ArrayBuffer for later use in auto-fix
    try {
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);
      console.log("✅ File buffer stored for auto-fix functionality");
    } catch (error) {
      console.warn("⚠️ Could not read file buffer:", error);
      setFileBuffer(null);
    }
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

      if (response.ok && result.success) {
        setImportResult(result);

        // Don't parse here - we'll only parse if user tries to apply auto-fix
        // This avoids the "Could not find file in options" error

        // Don't auto-redirect if there are issues that can be fixed
        const hasAutoFixableIssues =
          result.validation?.warnings?.some((issue) => issue.autoFixable) ||
          false;

        if (!hasAutoFixableIssues) {
          // No fixable issues - proceed with auto-redirect after 3 seconds
          setTimeout(() => {
            onImportSuccess();
          }, 3000);
        }
        // If there are fixable issues, user must manually proceed or apply fixes
      } else {
        setImportResult({
          success: false,
          error: result.error || "Failed to import document",
          details: result.details,
          message: "",
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: "Network error. Please check your connection and try again.",
        message: "",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-300">
                      Import Successful!
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-200">{importResult.message}</p>
                    {importResult.structure && (
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-green-300">Acts:</span>
                          <span className="ml-2 font-semibold text-white">
                            {importResult.structure.acts}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-300">Chapters:</span>
                          <span className="ml-2 font-semibold text-white">
                            {importResult.structure.chapters}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-300">Scenes:</span>
                          <span className="ml-2 font-semibold text-white">
                            {importResult.structure.scenes}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-300">Words:</span>
                          <span className="ml-2 font-semibold text-white">
                            {importResult.structure.wordCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Issues Section */}
                {importResult.validation && (
                  <>
                    {importResult.validation.warnings &&
                    importResult.validation.warnings.length > 0 ? (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-yellow-300">
                            Issues Detected
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-yellow-200">
                            {importResult.issuesDetected} potential issue
                            {importResult.issuesDetected !== 1 ? "s" : ""} found
                            in your document:
                          </p>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {importResult.validation.warnings.map(
                              (issue, index) => (
                                <div
                                  key={index}
                                  className="bg-yellow-800/20 rounded-lg p-3 border border-yellow-600"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-start space-x-2 mb-2">
                                        {getSeverityIcon(issue.severity)}
                                        <div className="flex-1">
                                          <p className="text-sm text-yellow-100 font-medium">
                                            {issue.message}
                                          </p>
                                          {issue.suggestion && (
                                            <p className="text-xs text-yellow-200 mt-1">
                                              {issue.suggestion}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Auto-fix button */}
                                      {issue.autoFixable && issue.fixAction && (
                                        <div className="mt-2">
                                          <button
                                            onClick={() => handleAutoFix(issue)}
                                            disabled={isApplyingFix !== null}
                                            className={`flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors ${
                                              isApplyingFix === issue.type
                                                ? "bg-blue-700"
                                                : ""
                                            }`}
                                          >
                                            {isApplyingFix === issue.type ? (
                                              <>
                                                <Settings className="w-3 h-3 animate-spin" />
                                                <span>Applying...</span>
                                              </>
                                            ) : (
                                              <>
                                                <Zap className="w-3 h-3" />
                                                <span>
                                                  Auto-fix:{" "}
                                                  {issue.fixAction.description}
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          <p className="text-xs text-yellow-300 mt-3">
                            Issues marked with{" "}
                            <Zap className="w-3 h-3 inline mx-1" /> can be
                            automatically fixed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-green-300">
                            Document Quality
                          </h3>
                        </div>
                        <div className="mt-2">
                          <span className="text-green-200">
                            No issues detected! Your document structure looks
                            excellent.
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Success note or Continue button */}
                {importResult.validation?.warnings?.some(
                  (issue) => issue.autoFixable
                ) ? (
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
                ) : (
                  <div className="text-center text-sm text-gray-400">
                    Redirecting to manuscript editor...
                  </div>
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
