"use client"

import * as React from "react"
import {
  Award,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Trophy,
  Users,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { StreakBadge } from "@/components/sidebar/streak-badge"
import { SidebarLevelBadge } from "@/components/sidebar/level-badge"
import Link from "next/link"
import { usePathname } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Training",
      url: "/training",
      icon: BookOpen,
    },
    {
      title: "Progress",
      url: "/progress",
      icon: Trophy,
    },
    {
      title: "Achievements",
      url: "/achievements",
      icon: Award,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center text-white dark:text-zinc-900">
              P
            </div>
            <span>Peck</span>
          </div>
          <div className="flex items-center gap-2">
            <SidebarLevelBadge />
            <StreakBadge />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex justify-between">
              <div>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title} className="h-10">
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="mailto:dwyc.co@gmail.com">
                <MessageSquare />
                <span>Have Feedback?</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-center p-4 text-xs font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
          <span>Built with</span>
          <span className="mx-1 text-red-500">❤️</span>
          <span>by Mateo</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
