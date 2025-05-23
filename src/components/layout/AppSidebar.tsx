
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  User,
  FileText, 
  Clock,
  Home,
  Settings,
  CreditCard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { getUserProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/storage";

export default function AppSidebar() {
  // Fix the sidebar context access - using open instead of isOpen
  const sidebar = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-primary/10" 
      : "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-muted";

  return (
    <Sidebar className={sidebar.open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end md:hidden">
      </SidebarTrigger>
      
      <SidebarContent>
        {userProfile ? (
          <div className={`${sidebar.open ? 'px-4 py-6' : 'px-2 py-4'} flex items-center gap-2`}>
            {userProfile.logo ? (
              <img 
                src={userProfile.logo} 
                alt={userProfile.businessName || userProfile.name} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {userProfile.name.charAt(0)}
              </div>
            )}
            {sidebar.open && (
              <div className="overflow-hidden">
                <p className="font-semibold truncate">{userProfile.businessName || userProfile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${sidebar.open ? 'px-4 py-6' : 'px-2 py-4'}`}>
            <div className="w-10 h-10 rounded-full bg-muted"></div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavCls}>
                    <Home className="h-4 w-4" />
                    {sidebar.open && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/profile" className={getNavCls}>
                    <User className="h-4 w-4" />
                    {sidebar.open && <span>Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/create-invoice" className={getNavCls}>
                    <CreditCard className="h-4 w-4" />
                    {sidebar.open && <span>Create Invoice</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/invoices" className={getNavCls}>
                    <FileText className="h-4 w-4" />
                    {sidebar.open && <span>Invoices</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/history" className={getNavCls}>
                    <Clock className="h-4 w-4" />
                    {sidebar.open && <span>History</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="h-4 w-4" />
                    {sidebar.open && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
