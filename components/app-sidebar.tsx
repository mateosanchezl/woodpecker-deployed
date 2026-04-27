"use client";

import * as React from "react";
import Image from "next/image";
import {
  Award,
  BookOpen,
  Coffee,
  LayoutDashboard,
  MessageSquare,
  RefreshCcw,
  ScrollText,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { StreakBadge } from "@/components/sidebar/streak-badge";
import { UserLevelDisplay } from "@/components/sidebar/user-level-display";
import { ReviewPromptModal } from "@/components/review/review-prompt-modal";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navCategories = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Training", url: "/training", icon: BookOpen },
      { title: "Review", url: "/training/review", icon: RefreshCcw },
      { title: "Progress", url: "/progress", icon: Trophy },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Achievements", url: "/achievements", icon: Award },
      { title: "Changelog", url: "/changelog", icon: ScrollText },
      { title: "Leaderboard", url: "/leaderboard", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Support", url: "/support", icon: Coffee },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

function isSidebarItemActive(pathname: string, itemUrl: string): boolean {
  if (itemUrl === "/training/review") {
    return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
  }

  if (itemUrl === "/training") {
    return (
      pathname === itemUrl ||
      (pathname.startsWith("/training/") &&
        !pathname.startsWith("/training/review"))
    );
  }

  return pathname === itemUrl;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-0 border-b border-sidebar-border/60">
        <div className="flex items-center justify-between px-3 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              <Image
                src="/pecklogoicon.png"
                alt="Peck Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="font-serif text-2xl font-black tracking-tighter">
              Peck
            </span>
          </Link>
          <StreakBadge />
        </div>
        <UserLevelDisplay />
      </SidebarHeader>
      <SidebarContent className="py-1">
        {navCategories.map((category, idx) => (
          <SidebarGroup key={category.label} className="px-2">
            {idx > 0 && <SidebarSeparator className="mb-2" />}
            <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {category.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-1">
              <SidebarMenu className="flex flex-col gap-0.5">
                {category.items.map((item) => {
                  const isActive = isSidebarItemActive(pathname, item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="group rounded-xl transition-all duration-200"
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={cn(
                            "transition-all duration-200",
                            isActive
                              ? "text-primary scale-110"
                              : "opacity-70 group-hover:scale-110 group-hover:text-foreground group-hover:opacity-100"
                          )} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsReviewModalOpen(true)}
              className="group rounded-xl transition-all duration-200 hover:bg-primary/5 hover:text-primary"
            >
              <MessageSquare className="opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:text-primary group-hover:opacity-100" />
              <span className="font-medium">Have Feedback?</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 text-[11px] font-medium text-muted-foreground/60 transition-colors hover:text-muted-foreground">
          <span>Built with</span>
          <span className="text-primary animate-pulse">♥</span>
          <span>by Mateo</span>
        </div>
      </SidebarFooter>
      <ReviewPromptModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
      />
      <SidebarRail />
    </Sidebar>
  );
}
