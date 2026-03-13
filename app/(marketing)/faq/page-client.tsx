import Link from "next/link";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { MotionDiv } from "@/components/marketing/motion-div";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";
import { faqs } from "./faq-data";

export default function FAQPageContent() {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            QUESTIONS
          </span>
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            ANSWERS
          </span>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                  FAQ
                </span>
              </div>

              <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
                Knowledge <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-primary bg-300% animate-gradient">
                  base.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about the Woodpecker Method and how
                Peck helps you master it.
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      <section className="py-32 relative bg-foreground text-background overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-[4rem] sm:text-[6rem] font-black tracking-tighter leading-[0.9] mb-8">
            Ready to <span className="italic text-primary">try it?</span>
          </h2>
          <p className="text-2xl opacity-80 mb-12 font-medium max-w-2xl mx-auto">
            Start training for free. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto h-20 px-12 text-xl font-black rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)]"
              >
                Get started free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
