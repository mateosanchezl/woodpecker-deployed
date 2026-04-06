"use client"

import { useXp } from "@/hooks/use-xp"
import { useAppBootstrap } from "@/hooks/use-app-bootstrap"
import { Progress } from "@/components/ui/progress"
import { SupporterBadge } from "@/components/supporters/supporter-badge"
import { Loader2 } from "lucide-react"

export function UserLevelDisplay() {
    const { data: xpData, isLoading } = useXp()
    const { data: supporter, isLoading: isSupporterLoading } = useAppBootstrap({
        select: (data) => ({
            isSupporter: data.user.isSupporter,
            supporterBadgeGrantedAt: data.user.supporterBadgeGrantedAt,
        }),
    })

    if (isLoading || isSupporterLoading) {
        return (
            <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!xpData) {
        return null
    }

    return (
        <div className="px-3 pb-4 pt-1">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 text-xl shadow-sm">
                    {xpData.levelTitle.icon}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold tracking-tight">
                            {xpData.levelTitle.title}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Level {xpData.currentLevel}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Progress value={xpData.levelProgress.progressPercent} className="h-1.5 rounded-full" />
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                            <span>{Math.floor(xpData.levelProgress.xpInCurrentLevel)} XP</span>
                            <span>{xpData.levelProgress.xpNeededForNextLevel} XP</span>
                        </div>
                    </div>
                    {supporter?.isSupporter ? (
                        <SupporterBadge
                            grantedAt={supporter.supporterBadgeGrantedAt}
                            className="self-start"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}
