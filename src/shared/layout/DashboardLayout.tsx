import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, className = "" }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      {/* Main Content Area */}
      <main className={`
        transition-all duration-500 ease-out
        ${sidebarExpanded ? 'md:ml-72' : 'md:ml-32'}
        min-h-screen 
        pt-[80px]
        ${className}
      `}>
        <div className="px-4 md:px-6 py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;