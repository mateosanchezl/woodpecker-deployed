"use client"

import { useXp } from "@/hooks/use-xp"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

export function UserLevelDisplay() {
    const { data: xpData, isLoading } = useXp()

    if (isLoading) {
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
        <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">
                        {xpData.levelTitle.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                            Level {xpData.currentLevel}
                        </span>
                        <span className="text-sm font-bold leading-none">
                            {xpData.levelTitle.title}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-primary">
                        {Math.floor(xpData.levelProgress.xpInCurrentLevel)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        /{xpData.levelProgress.xpNeededForNextLevel} XP
                    </span>
                </div>
            </div>

            <Progress value={xpData.levelProgress.progressPercent} className="h-2" />
        </div>
    )
}
