import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <Image
              src="/darklogo.png"
              alt="Peck Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-serif tracking-tight">Peck</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              About
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline-block"
            >
              Docs
            </Link>
            <Link
              href="/woodpecker-method"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden lg:inline-block"
            >
              Woodpecker Method
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="shadow-md shadow-primary/20">
                Start Training Free
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Image
                src="/darklogo.png"
                alt="Peck Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span>Peck</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Peck. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link
                href="/features"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Blog
              </Link>
              <Link
                href="/woodpecker-method"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Woodpecker Method
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Terms
              </Link>
              <a
                href="mailto:support@peckchess.com"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
