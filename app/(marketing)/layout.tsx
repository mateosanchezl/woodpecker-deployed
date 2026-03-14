import Link from "next/link";
import Image from "next/image";
import { LandingNavbar } from "@/components/landing/navbar";
import { XIcon } from "@/components/icons/x-icon";
import { SOCIAL_LINKS } from "@/lib/site-config";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-4 group mb-6">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-transform group-hover:rotate-12">
                  <Image
                    src="/pecklogoicon.png"
                    alt="Peck Logo"
                    fill
                    sizes="48px"
                    className="object-contain p-2"
                  />
                </div>
                <span className="font-serif text-4xl font-black tracking-tighter">
                  Peck
                </span>
              </Link>
              <p className="text-xl font-medium text-muted-foreground max-w-sm">
                The scientific way to master chess tactics through spaced repetition.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">Product</h4>
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "The Method", href: "/woodpecker-method" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">Company</h4>
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "mailto:support@peckchess.com" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <a
                href={SOCIAL_LINKS.x.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Follow Peck on X (${SOCIAL_LINKS.x.handle})`}
                className="inline-flex items-center gap-3 text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                <XIcon className="size-4" />
                <span>{SOCIAL_LINKS.x.handle}</span>
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm font-bold text-muted-foreground">
              © {new Date().getFullYear()} Peck. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm font-bold text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
