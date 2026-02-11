"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useScroll,
  useMotionValueEvent,
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Blog", href: "/blog" },
  { name: "Woodpecker Method", href: "/woodpecker-method" },
];

export function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > 10 && latest > previous) {
      setIsScrolled(true);
    } else if (latest < 10) {
      setIsScrolled(false);
    }
  });

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b py-2",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm"
          : "bg-transparent border-transparent",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-md transition-transform group-hover:scale-105">
              <Image
                src="/darklogo.png"
                alt="Peck Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              Peck
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  Start Training
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/darklogo.png"
                      alt="Peck"
                      width={24}
                      height={24}
                    />
                    Peck
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  <nav className="flex flex-col gap-3">
                    {navItems.map((item) => (
                      <SheetClose key={item.name} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="flex flex-col gap-3 mt-4">
                    <SignedOut>
                      <SheetClose asChild>
                        <Link href="/sign-in" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full justify-start rounded-full"
                          >
                            Log in
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/sign-up" className="w-full">
                          <Button className="w-full rounded-full shadow-md">
                            Start Training
                          </Button>
                        </Link>
                      </SheetClose>
                    </SignedOut>
                    <SignedIn>
                      <SheetClose asChild>
                        <Link href="/dashboard" className="w-full">
                          <Button className="w-full rounded-full">
                            Go to Dashboard
                          </Button>
                        </Link>
                      </SheetClose>
                    </SignedIn>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
