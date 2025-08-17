"use client";

import React from "react";
import { Users } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/ui";

export default function CharactersPage() {
  return (
    <div className="p-8">
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Character Vault
        </h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Manage your characters, relationships, and character arcs across your
          entire story.
        </p>
        <Card className="max-w-2xl mx-auto">
          <CardHeader
            title="Coming Soon"
            subtitle="The character vault is under development"
          />
          <CardContent>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">
                  Character profiles and backstories
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">
                  Relationship maps and connections
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">
                  Character arc tracking across acts
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">
                  Visual references and inspiration
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
