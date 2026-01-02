import React from "react";
import { Home, Library, Target, TrendingUp, Compass, Settings, Guitar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import { cn } from "@/lib/utils";
const items = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Assessment", icon: Target, url: "/assessment" },
  { title: "Exercises", icon: Library, url: "/library" },
  { title: "Roadmaps", icon: Compass, url: "/roadmaps" },
  { title: "Progress", icon: TrendingUp, url: "/progress" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
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
        <div className="p-4 flex items-center gap-2">
          <div className="size-8 rounded-full bg-accent flex items-center justify-center border border-border">
            <span className="text-[10px] font-bold">GG</span>
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-foreground">Guitar God</span>
            <span className="text-[10px] text-muted-foreground">Pro Shredder</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}