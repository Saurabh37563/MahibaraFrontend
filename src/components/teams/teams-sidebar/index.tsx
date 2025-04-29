'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiSidebar } from "react-icons/fi";
import { SidebarProvider } from "@/components/ui/sidebar";
import DesktopSidebar from "./desktop-sidebar";
import MobileSidebar from "./mobile-sidebar";

export default function FunctionsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isOpen) {
      setRenderMobile(true);
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        setRenderMobile(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isOpen]);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {isMobile && !isOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-[14px] left-2 z-[60]"
          onClick={toggleSidebar}
        >
          <FiSidebar className="size-6" />
        </Button>
      )}

      <SidebarProvider>
        {!isMobile && <DesktopSidebar />}

        {renderMobile && (
          <MobileSidebar 
            isOpen={isOpen}
            toggleSidebar={toggleSidebar}
          />
        )}
      </SidebarProvider>
    </>
  );
}