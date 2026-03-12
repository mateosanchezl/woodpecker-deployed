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
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
                            Everything you need to <br className="hidden sm:block" />
                            <span className="text-primary italic pr-2">master tactics</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium">
                            We&apos;ve combined the most effective training method with modern technology to create the ultimate chess improvement tool.
                        </p>
                    </motion.div>
                </div>

                <Tabs defaultValue="method" className="w-full max-w-5xl mx-auto" onValueChange={setActiveTab}>
                    <div className="flex justify-center mb-12 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar px-4">
                        <TabsList className="h-auto p-1.5 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full shadow-sm">
                            <TabsTrigger
                                value="method"
                                className="rounded-full px-5 sm:px-6 py-3 text-sm sm:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                            >
                                <Brain className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">The Method</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="gamification"
                                className="rounded-full px-5 sm:px-6 py-3 text-sm sm:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                            >
                                <Trophy className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Gamification</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="analytics"
                                className="rounded-full px-5 sm:px-6 py-3 text-sm sm:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                            >
                                <TrendingUp className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Analytics</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="content"
                                className="rounded-full px-5 sm:px-6 py-3 text-sm sm:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                            >
                                <Target className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Content</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="relative min-h-[500px] sm:min-h-[550px] rounded-[2.5rem] border border-border/60 bg-background/60 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                        {/* Decorative inner glow */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

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
                    <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">{title}</h3>
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                        {description}
                    </p>
                </div>

                <div className="space-y-4">
                    {features.map((feature, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-foreground">{feature.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative h-full min-h-[350px] lg:min-h-[450px] flex items-center justify-center p-6 sm:p-10 bg-linear-to-br from-background/50 to-muted/30 rounded-[2rem] border border-border/50 overflow-hidden shadow-inner">
                {visual}
            </div>
        </motion.div>
    );
}

function MethodVisual() {
    return (
        <div className="w-full max-w-md space-y-6">
            {[
                { cycle: 1, time: "60m", label: "Initial Solve", width: "100%", color: "bg-muted-foreground/30" },
                { cycle: 2, time: "30m", label: "First Repetition", width: "50%", color: "bg-primary/40" },
                { cycle: 3, time: "15m", label: "Reinforcement", width: "25%", color: "bg-primary/60" },
                { cycle: 4, time: "7.5m", label: "Mastery", width: "12.5%", color: "bg-primary" },
            ].map((item, i) => (
                <div key={i} className="relative bg-background/50 p-4 rounded-2xl border border-border/50 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="font-bold text-foreground flex items-center gap-2">
                            {i === 3 && <Zap className="w-4 h-4 text-primary fill-primary/20" />}
                            {item.label}
                        </span>
                        <span className="font-mono font-bold text-muted-foreground">{item.time}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: item.width }}
                            transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                            className={cn("h-full rounded-full relative overflow-hidden", item.color)}
                        >
                            {i === 3 && (
                                <motion.div 
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-full bg-linear-to-r from-transparent via-white/30 to-transparent"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GamificationVisual() {
    return (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-2 bg-background/80 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-md flex items-center justify-between transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-chart-2/15 text-chart-2 rounded-xl">
                        <Flame className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="font-black text-xl">12 Day Streak</div>
                        <div className="text-sm font-medium text-muted-foreground">Keep it up!</div>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {[1, 1, 1, 1, 0].map((active, i) => (
                        <div key={i} className={cn("w-3 h-10 rounded-full", active ? "bg-chart-2 shadow-[0_0_10px_rgba(255,165,0,0.3)]" : "bg-muted")} />
                    ))}
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-md flex flex-col items-center justify-center text-center space-y-3 transition-all"
            >
                <div className="w-14 h-14 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-600 mb-2 shadow-inner">
                    <Trophy className="w-7 h-7" />
                </div>
                <div className="font-black text-lg">Top 5%</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Global League</div>
            </motion.div>

            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-md flex flex-col items-center justify-center text-center space-y-3 transition-all"
            >
                <div className="w-14 h-14 rounded-full bg-chart-5/15 flex items-center justify-center text-chart-5 mb-2 shadow-inner">
                    <Sparkles className="w-7 h-7" />
                </div>
                <div className="font-black text-lg">Speed Demon</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Achievement</div>
            </motion.div>
        </div>
    );
}

function AnalyticsVisual() {
    return (
        <div className="w-full max-w-md bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-xl">Woodpecker Index</h4>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    Last 30 Days
                </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 relative">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-border" />)}
                </div>

                {[35, 45, 40, 55, 60, 50, 65, 75, 70, 85, 80, 95].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05, type: "spring" }}
                        className="w-full bg-primary/20 rounded-t-md relative group hover:bg-primary/30 transition-colors cursor-pointer"
                    >
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "100%" }}
                            transition={{ duration: 0.6, delay: i * 0.05, type: "spring" }}
                            className="absolute bottom-0 left-0 w-full bg-primary rounded-t-md shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                        />
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between mt-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>W1</span>
                <span>W2</span>
                <span>W3</span>
                <span>W4</span>
            </div>
        </div>
    );
}

function ContentVisual() {
    return (
        <div className="relative w-full max-w-[320px] aspect-square group">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background/50 p-2 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="rounded-xl overflow-hidden ring-1 ring-border/50 shadow-inner">
                    <Chessboard
                        options={{
                            position: "r1bqk2r/pp2bppp/2n2n2/2pp4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w kq - 4 8",
                            allowDragging: false,
                            darkSquareStyle: { backgroundColor: 'oklch(0.6 0.1 145)' },
                            lightSquareStyle: { backgroundColor: 'oklch(0.96 0.03 145)' },
                            boardStyle: {
                                borderRadius: '12px',
                            },
                        }}
                    />
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl transform transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-1 rounded bg-chart-2/10 text-chart-2 text-[10px] font-black uppercase tracking-wider">Hard</span>
                        <span className="text-sm font-bold">Sicilian Defense</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Find the best move for White</div>
                </div>
            </div>
        </div>
    );
}
