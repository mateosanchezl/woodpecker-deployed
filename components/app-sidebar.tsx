"use client"

import * as React from "react"
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Trophy,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
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
              W
            </div>
            <span>Woodpecker</span>
          </div>
          <StreakBadge />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
