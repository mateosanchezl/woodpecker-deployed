import Link from "next/link";
import Image from "next/image";
import { LandingNavbar } from "@/components/landing/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-32 lg:pb-20">
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
