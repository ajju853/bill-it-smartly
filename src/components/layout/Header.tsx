
import { useEffect, useState } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "../ThemeProvider";
import { getUserProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <header className="flex h-16 items-center border-b px-4 md:px-6">
      <SidebarTrigger>
        <Button size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SidebarTrigger>
      
      <div className="ml-4 flex items-center gap-2">
        <span className="font-semibold text-lg">Smart Billing System</span>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        {userProfile && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden md:inline-block">
              {userProfile.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
