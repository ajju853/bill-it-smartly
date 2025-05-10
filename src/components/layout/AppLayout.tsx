
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { ThemeProvider } from "../ThemeProvider";
import WelcomeDialog from "../welcome/WelcomeDialog";

export default function AppLayout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="billing-app-theme">
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <div className="flex flex-1 w-full">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-6">
              <Outlet />
            </main>
          </div>
          <WelcomeDialog />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
