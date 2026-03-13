"use client";

import { motion } from "framer-motion";
import {
    Brain,
    Trophy,
    TrendingUp,
    Target,
    Zap,
    Clock,
    Flame,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chessboard } from "react-chessboard";

export function FeaturesSection() {
    const features = [
        {
            id: "01",
            title: "THE METHOD",
            subtitle: "Solve, Repeat, Internalize",
            description: "Based on spaced repetition, the Woodpecker Method forces you to solve the same set of puzzles repeatedly, halving your time each cycle until patterns become pure instinct.",
            color: "bg-primary",
            textColor: "text-primary",
            visual: <MethodVisual />
        },
        {
            id: "02",
            title: "GAMIFICATION",
            subtitle: "Addictive Progression",
            description: "Chess improvement is a marathon. Our gamification system uses streaks, achievements, and global leagues to make daily tactical training impossible to put down.",
            color: "bg-chart-2",
            textColor: "text-chart-2",
            visual: <GamificationVisual />
        },
        {
            id: "03",
            title: "ANALYTICS",
            subtitle: "Data-Driven Mastery",
            description: "Stop guessing. Track your Woodpecker Index, accuracy, and speed across distinct tactical motifs to expose exactly where your calculation fails.",
            color: "bg-foreground",
            textColor: "text-foreground",
            visual: <AnalyticsVisual />
        },
        {
            id: "04",
            title: "CONTENT",
            subtitle: "Curated Excellence",
            description: "Train with over 1.5 million verified Lichess puzzles. Every position is drawn from real human games, categorized by precise tactical themes and rating bands.",
            color: "bg-accent",
            textColor: "text-accent",
            visual: <ContentVisual />
        }
    ];

    return (
        <section id="how-it-works" className="py-32 relative overflow-hidden bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-32 md:mb-48">
                    <h2 className="text-[12vw] leading-[0.8] font-black tracking-tighter uppercase mb-8">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">SYSTEM</span>
                        <br />
                        OVERVIEW
                    </h2>
                </div>

                <div className="space-y-32 md:space-y-64 pb-32">
                    {features.map((feature, idx) => (
                        <div key={feature.id} className={cn("flex flex-col gap-12 lg:gap-24", idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row")}>
                            {/* Text Content */}
                            <div className="flex-1 flex flex-col justify-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="relative"
                                >
                                    <div className={cn("text-[8rem] md:text-[14rem] font-black leading-none opacity-[0.03] absolute -top-20 -left-8 md:-top-32 md:-left-16 select-none pointer-events-none", feature.textColor)}>
                                        {feature.id}
                                    </div>
                                    <h3 className="text-sm font-black tracking-widest uppercase mb-6 flex items-center gap-4 z-10 relative">
                                        <span className={cn("w-12 h-1", feature.color)}></span>
                                        {feature.title}
                                    </h3>
                                    <h4 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 z-10 relative">
                                        {feature.subtitle}
                                    </h4>
                                    <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed z-10 relative">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Visual Content */}
                            <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotate: idx % 2 === 0 ? 5 : -5 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                    className="w-full max-w-lg relative z-20"
                                >
                                    {feature.visual}
                                </motion.div>
                                
                                {/* Background glow for visual */}
                                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full blur-[100px] opacity-20 pointer-events-none -z-10", feature.color)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function MethodVisual() {
    return (
        <div className="w-full space-y-6 bg-card/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] border-2 border-primary/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="w-48 h-48 text-primary" />
            </div>
            
            <h4 className="text-3xl font-black mb-8 relative z-10">Cycle Compression</h4>
            
            {[
                { cycle: 1, time: "60m", label: "Initial Solve", width: "100%", color: "bg-muted-foreground/30" },
                { cycle: 2, time: "30m", label: "First Repetition", width: "50%", color: "bg-primary/40" },
                { cycle: 3, time: "15m", label: "Reinforcement", width: "25%", color: "bg-primary/60" },
                { cycle: 4, time: "7.5m", label: "Mastery", width: "12.5%", color: "bg-primary" },
            ].map((item, i) => (
                <div key={i} className="relative z-10">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                            {i === 3 && <Zap className="w-4 h-4 text-primary fill-primary/20" />}
                            {item.label}
                        </span>
                        <span className="font-mono font-black text-lg">{item.time}</span>
                    </div>
                    <div className="h-6 bg-secondary rounded-full overflow-hidden border border-border/50">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: item.width }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.2 + (i * 0.2), ease: "easeOut" }}
                            className={cn("h-full relative overflow-hidden", item.color)}
                        >
                            {i === 3 && (
                                <motion.div 
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-full bg-linear-to-r from-transparent via-white/40 to-transparent"
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
        <div className="grid grid-cols-2 gap-4 w-full">
            <motion.div 
                whileHover={{ scale: 1.05 }}
                className="col-span-2 bg-chart-2 text-white p-8 rounded-[2rem] shadow-2xl flex items-center justify-between transition-transform"
            >
                <div className="flex items-center gap-6">
                    <Flame className="w-16 h-16 opacity-80" />
                    <div>
                        <div className="font-black text-4xl">14 Days</div>
                        <div className="text-lg font-bold uppercase tracking-widest opacity-80">Active Streak</div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-card p-8 rounded-[2rem] border-2 border-border shadow-xl flex flex-col items-center justify-center text-center transition-transform"
            >
                <Trophy className="w-16 h-16 text-yellow-500 mb-6" />
                <div className="font-black text-3xl">Top 5%</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Global League</div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-card p-8 rounded-[2rem] border-2 border-border shadow-xl flex flex-col items-center justify-center text-center transition-transform"
            >
                <Sparkles className="w-16 h-16 text-primary mb-6" />
                <div className="font-black text-3xl">Demon</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Speed Badge</div>
            </motion.div>
        </div>
    );
}

function AnalyticsVisual() {
    return (
        <div className="w-full bg-foreground text-background p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64" />
            </div>

            <div className="flex items-center justify-between mb-12 relative z-10">
                <h4 className="font-black text-3xl uppercase tracking-tight">Index Score</h4>
                <div className="text-5xl font-black text-primary">
                    2,450
                </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-4 relative z-10">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-background" />)}
                </div>

                {[35, 45, 40, 55, 60, 50, 65, 75, 70, 85, 80, 95].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                        className="w-full bg-primary/30 relative group hover:bg-primary transition-colors cursor-pointer"
                    >
                        <motion.div 
                            initial={{ height: 0 }}
                            whileInView={{ height: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                            className="absolute bottom-0 left-0 w-full bg-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]" 
                        />
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between mt-8 text-sm font-black text-background/50 uppercase tracking-widest relative z-10">
                <span>Cycle 1</span>
                <span>Cycle 4</span>
            </div>
        </div>
    );
}

function ContentVisual() {
    return (
        <div className="relative w-full aspect-square group perspective-1000">
            <motion.div 
                whileHover={{ rotateY: -10, rotateX: 10 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-border/50 bg-card p-4 preserve-3d"
            >
                <div className="absolute inset-0 bg-accent/5" />
                <div className="rounded-[2rem] overflow-hidden shadow-inner h-full flex flex-col relative z-10">
                    <Chessboard
                        options={{
                            position: "r1bqk2r/pp2bppp/2n2n2/2pp4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w kq - 4 8",
                            allowDragging: false,
                            darkSquareStyle: { backgroundColor: 'oklch(0.6 0.1 145)' },
                            lightSquareStyle: { backgroundColor: 'oklch(0.96 0.03 145)' },
                            boardStyle: {
                                borderRadius: '1.5rem',
                                paddingBottom: '2rem'
                            },
                        }}
                    />
                </div>
                
                {/* Floating Meta Tag */}
                <div className="absolute bottom-8 left-8 right-8 bg-background/95 backdrop-blur-xl p-6 rounded-2xl border border-border shadow-2xl transform translateZ-50">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                            Verified
                        </span>
                        <span className="text-lg font-black tracking-tight">Sicilian Defense</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Motif</span>
                        <span>Rating: 2200</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
