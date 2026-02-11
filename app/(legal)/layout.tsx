import Link from "next/link";
import { LandingNavbar } from "@/components/landing/navbar";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-32 lg:pb-20">
          <div className="max-w-4xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div>© {new Date().getFullYear()} Peck. All rights reserved.</div>
              <div className="flex gap-6">
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>
                <a
                  href="mailto:dwyc.co@gmail.com"
                  className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
