import React from "react";
import {
  BookOpen,
  Users,
  GitBranch,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/ui";

interface DashboardPageProps {
  novelTitle: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ novelTitle }) => {
  // Mock data - this would come from your database
  const stats = {
    totalWords: 47500,
    chaptersWritten: 8,
    charactersCreated: 12,
    plotThreadsActive: 5,
    lastUpdated: "2 hours ago",
  };

  const recentActivity = [
    {
      action: 'Updated Chapter 8: "The Crimson Revelation"',
      time: "2 hours ago",
    },
    { action: "Added character: Lord Varian Blackthorne", time: "Yesterday" },
    { action: 'Resolved plot thread: "The Lost Heir"', time: "3 days ago" },
    { action: "Created new location: The Shadowlands", time: "1 week ago" },
  ];

  const quickActions = [
    {
      label: "Continue Writing",
      icon: BookOpen,
      href: "manuscript",
      color: "bg-red-600",
    },
    {
      label: "Add Character",
      icon: Users,
      href: "characters",
      color: "bg-blue-600",
    },
    {
      label: "Track Plot Thread",
      icon: GitBranch,
      href: "plotlines",
      color: "bg-green-600",
    },
    {
      label: "Build Timeline",
      icon: Clock,
      href: "timeline",
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{novelTitle}</h1>
        <p className="text-gray-300">Welcome back to your story workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Words</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalWords.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Chapters</p>
                <p className="text-2xl font-bold text-white">
                  {stats.chaptersWritten}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Characters</p>
                <p className="text-2xl font-bold text-white">
                  {stats.charactersCreated}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Threads</p>
                <p className="text-2xl font-bold text-white">
                  {stats.plotThreadsActive}
                </p>
              </div>
              <GitBranch className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Your latest updates" />
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" subtitle="Jump to any section" />
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {action.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="mt-8">
        <CardHeader
          title="Writing Progress"
          subtitle="Track your goals and milestones"
        />
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Word Count Goal</span>
                <span className="text-sm text-white">
                  {stats.totalWords.toLocaleString()} / 80,000
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.totalWords / 80000) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round((stats.totalWords / 80000) * 100)}%
                </div>
                <div className="text-sm text-gray-300">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(stats.totalWords / stats.chaptersWritten)}
                </div>
                <div className="text-sm text-gray-300">Avg Words/Chapter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.lastUpdated}
                </div>
                <div className="text-sm text-gray-300">Last Updated</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
