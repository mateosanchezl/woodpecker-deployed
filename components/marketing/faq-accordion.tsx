"use client";

import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MotionDiv } from "./motion-div";

type FAQItem = {
  q: string;
  a: string;
};

type FAQAccordionProps = {
  faqs: FAQItem[];
};

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <MotionDiv
            key={faq.q}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "overflow-hidden rounded-3xl border-2 transition-all duration-300",
              isOpen
                ? "border-primary/50 bg-card shadow-xl"
                : "border-border/50 bg-background hover:border-primary/30 hover:bg-muted/20",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-6 px-8 py-6 text-left sm:px-10 sm:py-8"
            >
              <span className="pr-8 text-xl font-bold tracking-tight sm:text-2xl">
                {faq.q}
              </span>
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300",
                  isOpen
                    ? "rotate-45 bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <Plus className="h-6 w-6" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="mx-4 mt-2 border-t border-border/20 px-8 pb-8 pt-6 text-lg font-medium leading-relaxed text-muted-foreground sm:mx-6 sm:px-10 sm:pb-10 sm:text-xl">
                    {faq.a}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        );
      })}
    </div>
  );
}
