import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BookOpen,
  FileText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/my/resources", label: "Resources", icon: FileText },
  { to: "/my/materials", label: "Materials", icon: BookOpen },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-svh">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-0 flex h-svh flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
            collapsed ? "w-14" : "w-56"
          )}
        >
          {/* Logo + collapse toggle */}
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
            {!collapsed && (
              <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
                LingoLearn
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col gap-1 p-2">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const link = (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger render={link} />
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col">
          {/* Navbar */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
            <div />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" />
                }
              >
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary text-[10px] font-medium text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">{user?.email}</span>
                <User className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <Separator />

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
