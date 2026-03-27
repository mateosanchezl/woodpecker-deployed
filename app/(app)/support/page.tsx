import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SUPPORT_LINKS } from '@/lib/site-config'
import { Coffee, ExternalLink, Heart } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6 md:py-10">
      <div className="space-y-2 px-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Support Peck
        </h1>
        <p className="text-lg text-muted-foreground">
          Help me keep the core experience free and improving.
        </p>
      </div>

      <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.06),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.03),transparent_40%)]" />
        
        <CardContent className="relative flex flex-col gap-8 p-6 sm:p-10">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-background/50 shadow-sm">
              <AvatarImage src="/me.jpg" alt="Mateo" className="object-cover" />
              <AvatarFallback className="bg-amber-100 text-lg font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                M
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Hi, I&apos;m Mateo.</h2>
              <p className="text-sm font-medium text-muted-foreground">Builder of Peck</p>
            </div>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              I&apos;m a university student, and I build Peck in the hours around my classes. 
              I started building it because I couldn&apos;t find a tool for the Woodpecker Method 
              that actually felt good to use.
            </p>
            <p>
              Peck is entirely a one-person project. If the app has helped your tactics or 
              made your training a bit more enjoyable, you can support its development with a coffee.
            </p>
            <p>
              Your support goes directly toward covering server costs, keeping the core experience free, 
              and giving me the room to thoughtfully polish the app and add new features.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 py-2 sm:flex-row sm:items-center sm:gap-6">
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-2xl text-base shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
            >
              <a
                href={SUPPORT_LINKS.buyMeACoffee.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Coffee className="size-5" />
                {SUPPORT_LINKS.buyMeACoffee.label}
                <ExternalLink className="size-4 opacity-70" />
              </a>
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Heart className="size-4 text-rose-500" />
              <span>Optional, but deeply appreciated.</span>
            </div>
          </div>

          <hr className="border-border/50" />

          <div className="space-y-6">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                If a coffee isn&apos;t in the cards right now, that&apos;s completely okay. Just using the app is a huge compliment.
              </p>
              <p>
                If you have ideas, spot any rough edges, or just want to request a feature, clicking the <strong className="font-medium text-foreground">Have Feedback?</strong> button in the sidebar helps shape what I build next more than you might think.
              </p>
              <p className="pt-2">
                Thanks for being here,<br />
                <strong className="font-medium text-foreground">Mateo</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
