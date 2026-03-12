"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useScroll,
  useMotionValueEvent,
  motion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu } from "lucide-react";
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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-4 pb-2 pointer-events-none">
      <motion.header
        className={cn(
          "pointer-events-auto w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 px-4 rounded-full",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            : "bg-transparent border-transparent",
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-md transition-transform group-hover:scale-105">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-background/60 backdrop-blur-xl rounded-full px-2 py-1.5 border border-border/40 shadow-sm">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-full transition-all hover:bg-background hover:shadow-sm text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="rounded-full font-bold text-muted-foreground hover:text-foreground hover:bg-background/50 h-10 px-5"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold shadow-lg h-10 px-6 transition-all hover:scale-105"
                >
                  Start Training
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold shadow-lg h-10 px-6 transition-all hover:scale-105"
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
                      src="/pecklogoicon.png"
                      alt="Peck Logo"
                      width={28}
                      height={28}
                    />
                    <span className="font-serif font-black">Peck</span>
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
    </div>
  );
}
