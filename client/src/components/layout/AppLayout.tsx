import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth";
import { useLocation, useRoute } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isLoginRoute] = useRoute("/login");

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginRoute) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, isLoginRoute, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral">
        <div className="text-xl font-medium text-primary">Loading...</div>
      </div>
    );
  }

  // If on login page or not authenticated, just render children without layout
  if (isLoginRoute || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar - hidden on mobile unless opened */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
