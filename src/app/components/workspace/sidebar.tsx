import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  GitBranch,
  Clock,
  Map,
  Shield,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

interface SidebarProps {
  novelId: string;
  novelTitle: string;
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  novelId,
  novelTitle,
  isCollapsed,
  onToggle,
}) => {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: `/novels/${novelId}/dashboard`,
    },
    {
      id: "manuscript",
      label: "Manuscript Manager",
      icon: BookOpen,
      href: `/novels/${novelId}/manuscript`,
    },
    {
      id: "characters",
      label: "Character Vault",
      icon: Users,
      href: `/novels/${novelId}/characters`,
    },
    {
      id: "plotlines",
      label: "Plot Threads",
      icon: GitBranch,
      href: `/novels/${novelId}/plotlines`,
    },
    {
      id: "timeline",
      label: "Timeline & Events",
      icon: Clock,
      href: `/novels/${novelId}/timeline`,
    },
    {
      id: "worldbuilding",
      label: "Locations & World",
      icon: Map,
      href: `/novels/${novelId}/worldbuilding`,
    },
    {
      id: "continuity",
      label: "Continuity Checker",
      icon: Shield,
      href: `/novels/${novelId}/continuity`,
    },
    {
      id: "inspiration",
      label: "Inspiration Hub",
      icon: Lightbulb,
      href: `/novels/${novelId}/inspiration`,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-black border-r border-gray-700 transition-all duration-300 flex flex-col z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="text-sm font-semibold text-white truncate">
                  {novelTitle}
                </h2>
                <p className="text-xs text-gray-400">Novel Workspace</p>
              </div>
            </div>
          )}

          {isCollapsed && <Crown className="w-6 h-6 text-red-500 mx-auto" />}

          <button
            onClick={() => onToggle(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.id} className="relative">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-red-900 text-white border border-red-700"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${active ? "text-red-400" : ""}`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/novels"
          className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
        >
          <ChevronLeft className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">Back to Novels</span>}
        </Link>
      </div>
    </div>
  );
};
