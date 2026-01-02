import React from "react";
import { Home, Library, Target, TrendingUp, Compass, Guitar, Flame } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User } from "@shared/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
const items = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Assessment", icon: Target, url: "/assessment" },
  { title: "Exercises", icon: Library, url: "/library" },
  { title: "Roadmaps", icon: Compass, url: "/roadmaps" },
  { title: "Progress", icon: TrendingUp, url: "/progress" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { data: user } = useQuery<User>({ 
    queryKey: ['user/profile'], 
    queryFn: () => api('/api/user/profile') 
  });
  const getRank = (streak: number) => {
    if (streak > 30) return "Guitar Sage";
    if (streak > 15) return "Virtuoso";
    if (streak > 5) return "Shredder";
    return "Apprentice";
  };
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Guitar className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground truncate">FretFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 flex items-center justify-between border-t border-zinc-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="size-8 shrink-0 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span className="text-[10px] font-bold text-orange-500">
                {user?.name?.[0] || 'G'}
              </span>
            </div>
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-medium text-foreground truncate">{user?.name || "Guitar God"}</span>
              <span className="text-[10px] text-muted-foreground truncate">{getRank(user?.streak || 0)}</span>
            </div>
          </div>
          {user?.streak && user.streak > 0 && (
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
              <Flame className="size-3 text-orange-500" />
              <span className="text-[10px] font-bold">{user.streak}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}