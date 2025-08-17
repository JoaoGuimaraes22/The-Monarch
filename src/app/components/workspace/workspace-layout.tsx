import React from "react";
import { Sidebar } from "./sidebar";
import { SidebarProvider, useSidebar } from "./sidebar-context";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  novelId: string;
  novelTitle: string;
}

const WorkspaceContent: React.FC<WorkspaceLayoutProps> = ({
  children,
  novelId,
  novelTitle,
}) => {
  const { isMainSidebarCollapsed, setIsMainSidebarCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        novelId={novelId}
        novelTitle={novelTitle}
        isCollapsed={isMainSidebarCollapsed}
        onToggle={setIsMainSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isMainSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = (props) => {
  return (
    <SidebarProvider>
      <WorkspaceContent {...props} />
    </SidebarProvider>
  );
};
