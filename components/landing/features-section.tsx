"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Trophy,
    TrendingUp,
    Target,
    Zap,
    Repeat,
    Clock,
    CheckCircle2,
    Sparkles,
    Flame,
    Medal
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Chessboard } from "react-chessboard";

export function FeaturesSection() {
    const [activeTab, setActiveTab] = useState("method");

    return (
        <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                        Everything you need to <span className="text-primary">master tactics</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        We've combined the most effective training method with modern technology to create the ultimate chess improvement tool.
                    </p>
                </div>

                <Tabs defaultValue="method" className="w-full max-w-5xl mx-auto" onValueChange={setActiveTab}>
                    <div className="flex justify-center mb-12 overflow-x-auto pb-4 sm:pb-0">
                        <TabsList className="h-auto p-1 bg-muted border border-border/50 rounded-full">
                            <TabsTrigger
                                value="method"
                                className="rounded-full px-6 py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <Brain className="w-4 h-4 mr-2" />
                                The Method
                            </TabsTrigger>
                            <TabsTrigger
                                value="gamification"
                                className="rounded-full px-6 py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                Gamification
                            </TabsTrigger>
                            <TabsTrigger
                                value="analytics"
                                className="rounded-full px-6 py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger
                                value="content"
                                className="rounded-full px-6 py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                <Target className="w-4 h-4 mr-2" />
                                Content
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="relative min-h-[500px] rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

                        <AnimatePresence mode="wait">
                            {activeTab === "method" && (
                                <TabsContent key="method" value="method" className="m-0 h-full p-0 outline-none">
                                    <FeatureContent
                                        title="The Woodpecker Method"
                                        description="Based on spaced repetition, the Woodpecker Method helps you internalize patterns by solving the same set of puzzles repeatedly, faster each time."
                                        features={[
                                            { icon: Repeat, text: "7 Cycles of repetition" },
                                            { icon: Clock, text: "Halve your time each cycle" },
                                            { icon: Brain, text: "Build subconscious pattern recognition" },
                                        ]}
                                        visual={<MethodVisual />}
                                    />
                                </TabsContent>
                            )}

                            {activeTab === "gamification" && (
                                <TabsContent key="gamification" value="gamification" className="m-0 h-full p-0 outline-none">
                                    <FeatureContent
                                        title="Stay Motivated"
                                        description="Chess improvement is a marathon, not a sprint. Our gamification system keeps you engaged and consistent with your training."
                                        features={[
                                            { icon: Flame, text: "Daily streaks & consistency tracking" },
                                            { icon: Medal, text: "Leagues & global leaderboards" },
                                            { icon: Sparkles, text: "Unlockable achievements & badges" },
                                        ]}
                                        visual={<GamificationVisual />}
                                    />
                                </TabsContent>
                            )}

                            {activeTab === "analytics" && (
                                <TabsContent key="analytics" value="analytics" className="m-0 h-full p-0 outline-none">
                                    <FeatureContent
                                        title="Track Your Progress"
                                        description="Detailed analytics help you understand your strengths and weaknesses. Watch your Woodpecker Index soar as you master patterns."
                                        features={[
                                            { icon: TrendingUp, text: "Accuracy & speed trends" },
                                            { icon: Target, text: "Theme-specific performance" },
                                            { icon: Zap, text: "Woodpecker Index calculation" },
                                        ]}
                                        visual={<AnalyticsVisual />}
                                    />
                                </TabsContent>
                            )}

                            {activeTab === "content" && (
                                <TabsContent key="content" value="content" className="m-0 h-full p-0 outline-none">
                                    <FeatureContent
                                        title="Premium Content"
                                        description="Access millions of high-quality puzzles from Lichess, curated and categorized to ensure you're learning real tactical motifs."
                                        features={[
                                            { icon: CheckCircle2, text: "1.5M+ verified puzzles" },
                                            { icon: Target, text: "Filtered by rating & theme" },
                                            { icon: Brain, text: "Real game positions, not compositions" },
                                        ]}
                                        visual={<ContentVisual />}
                                    />
                                </TabsContent>
                            )}
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>
        </section>
    );
}

function FeatureContent({ title, description, features, visual }: {
    title: string;
    description: string;
    features: { icon: any; text: string }[];
    visual: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 p-8 sm:p-12 h-full items-center"
        >
            <div className="flex flex-col justify-center space-y-8">
                <div>
                    <h3 className="text-3xl font-bold mb-4">{title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="space-y-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-full min-h-[300px] lg:min-h-[400px] flex items-center justify-center p-4 sm:p-8 bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
                {visual}
            </div>
        </motion.div>
    );
}

function MethodVisual() {
    return (
        <div className="w-full max-w-md space-y-6">
            {[
                { cycle: 1, time: "60m", label: "Initial Solve", width: "100%", color: "bg-primary/40" },
                { cycle: 2, time: "30m", label: "First Repetition", width: "50%", color: "bg-primary/60" },
                { cycle: 3, time: "15m", label: "Reinforcement", width: "25%", color: "bg-primary/80" },
                { cycle: 4, time: "7.5m", label: "Mastery", width: "12.5%", color: "bg-primary" },
            ].map((item, i) => (
                <div key={i} className="relative">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{item.label}</span>
                        <span className="font-mono text-muted-foreground">{item.time}</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: item.width }}
                            transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                            className={cn("h-full rounded-full", item.color)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function GamificationVisual() {
    return (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="col-span-2 bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">12 Day Streak</div>
                        <div className="text-xs text-muted-foreground">Keep it up!</div>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1, 1, 1, 1, 0].map((active, i) => (
                        <div key={i} className={cn("w-2 h-8 rounded-full", active ? "bg-orange-500" : "bg-muted")} />
                    ))}
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-1">
                    <Trophy className="w-6 h-6" />
                </div>
                <div className="font-bold">Top 5%</div>
                <div className="text-xs text-muted-foreground">Global League</div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="font-bold">Speed Demon</div>
                <div className="text-xs text-muted-foreground">Achievement Unlocked</div>
            </div>
        </div>
    );
}

function AnalyticsVisual() {
    return (
        <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold">Performance Trend</h4>
                <select className="text-xs bg-transparent border-none text-muted-foreground outline-none">
                    <option>Last 30 Days</option>
                </select>
            </div>

            <div className="h-48 flex items-end justify-between gap-2">
                {[35, 45, 40, 55, 60, 50, 65, 75, 70, 85, 80, 95].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="w-full bg-primary/20 rounded-t-sm relative group"
                    >
                        <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary/80" style={{ height: '100%' }} />
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
            </div>
        </div>
    );
}

function ContentVisual() {
    return (
        <div className="relative w-full max-w-[320px] aspect-square">
            <div className="absolute inset-0 bg-gradient-radial from-primary/15 to-transparent rounded-xl" />
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-border">
                <Chessboard
                    options={{
                        position: "r1bqk2r/pp2bppp/2n2n2/2pp4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w kq - 4 8",
                        allowDragging: false,
                        darkSquareStyle: { backgroundColor: 'oklch(0.6 0.1 145)' },
                        lightSquareStyle: { backgroundColor: 'oklch(0.96 0.03 145)' },
                        boardStyle: {
                            borderRadius: '0px',
                        },
                    }}
                />
                <div className="absolute bottom-4 left-4 right-4 bg-background/95 p-3 rounded-lg border border-border shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Hard</span>
                        <span className="text-xs font-medium">Sicilian Defense</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Find the best move for White</div>
                </div>
            </div>
        </div>
    );
}
