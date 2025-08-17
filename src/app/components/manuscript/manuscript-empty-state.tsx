import React from "react";
import { BookOpen, Upload, Plus, FileText } from "lucide-react";
import { Button, Card, CardHeader, CardContent } from "@/app/components/ui";

interface ManuscriptEmptyStateProps {
  onShowUploader: () => void;
  onStartWriting: () => void;
}

export const ManuscriptEmptyState: React.FC<ManuscriptEmptyStateProps> = ({
  onShowUploader,
  onStartWriting,
}) => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Manuscript Manager
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Import your existing manuscript or start writing from scratch. The
            Manuscript Manager will help you organize your story by acts,
            chapters, and scenes.
          </p>
        </div>

        {/* Import Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Import from Document */}
          <Card hover onClick={onShowUploader}>
            <CardHeader
              title="Import from Document"
              subtitle="Upload a .docx file to get started"
            />
            <CardContent>
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-red-500" />
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    Upload your existing manuscript and we&#39;ll automatically
                    detect:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Acts (Heading 1)</li>
                    <li>• Chapters (Heading 2)</li>
                    <li>• Scenes (*** or --- breaks)</li>
                    <li>• Word counts and structure</li>
                  </ul>
                </div>
                <Button variant="primary" className="w-full">
                  Import Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Start from Scratch */}
          <Card hover onClick={onStartWriting}>
            <CardHeader
              title="Start from Scratch"
              subtitle="Begin writing with a blank manuscript"
            />
            <CardContent>
              <div className="space-y-4">
                <Plus className="w-12 h-12 text-red-500" />
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    Start fresh with an empty manuscript and build your story:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Create acts and chapters manually</li>
                    <li>• Rich text editor for each scene</li>
                    <li>• AI writing assistance</li>
                    <li>• Automatic progress tracking</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full">
                  Start Writing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <Card className="mt-12">
          <CardHeader
            title="What You'll Get"
            subtitle="Powerful tools for epic storytelling"
          />
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <FileText className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Structured Writing
                </h3>
                <p className="text-sm text-gray-300">
                  Organize your story by acts, chapters, and scenes for better
                  flow and pacing.
                </p>
              </div>
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Rich Text Editor
                </h3>
                <p className="text-sm text-gray-300">
                  Write with formatting, focus mode, and real-time word count
                  tracking.
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 text-red-500 mx-auto mb-3 text-lg">
                  🤖
                </div>
                <h3 className="font-semibold text-white mb-2">AI Assistance</h3>
                <p className="text-sm text-gray-300">
                  Get help with writer&#39;s block, consistency checking, and
                  story development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
