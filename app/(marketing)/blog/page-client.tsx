import Link from "next/link";
import { MotionDiv } from "@/components/marketing/motion-div";
import { BlogPostCard } from "@/components/mdx/blog-post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Rss } from "lucide-react";

export type BlogListPost = {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  readingTime: number;
};

type BlogPageClientProps = {
  posts: BlogListPost[];
  tags: string[];
};

export default function BlogPageContent({
  posts,
  tags,
}: BlogPageClientProps) {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            CHESS
          </span>
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            JOURNAL
          </span>
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                Tips & Guides
              </span>
            </div>

            <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
              Master the <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-chart-2">
                Method.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              Articles and tips on the Woodpecker Method, tactical training, and
              improving your game with Peck.
            </p>

            <Link
              href="/blog/rss.xml"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-4 py-2 rounded-full border border-border"
            >
              <Rss className="h-4 w-4" />
              Subscribe via RSS
            </Link>
          </MotionDiv>
        </div>
      </section>

      {tags.length > 0 && (
        <section className="py-8 border-y border-border/40 bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground mr-2">
                Topics
              </span>
              {tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="outline"
                    className="text-sm px-4 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 ? (
        <section className="py-24 sm:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 sm:grid-cols-2 max-w-6xl mx-auto">
              {posts.map((post, i) => (
                <MotionDiv
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BlogPostCard
                    title={post.title}
                    description={post.description}
                    date={post.date}
                    slug={post.slug}
                    tags={post.tags}
                    image={post.image}
                    imageAlt={post.imageAlt}
                    readingTime={post.readingTime}
                  />
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[3rem] border-2 border-border/50 bg-card p-12 sm:p-20 text-center max-w-4xl mx-auto shadow-xl">
              <h2 className="text-4xl font-black mb-6 tracking-tight">
                Articles coming soon
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                We&apos;re preparing guides on cycle planning, rating bands, and
                how to get the most from the Woodpecker Method. In the meantime,
                dive into the full guide below.
              </p>
              <Link href="/woodpecker-method">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg rounded-[2rem] font-black"
                >
                  Read the Woodpecker Method guide
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-32 relative bg-foreground text-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[200px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-[4rem] sm:text-[6rem] font-black tracking-tighter leading-[0.9] mb-8">
            Start training <span className="italic text-primary">today.</span>
          </h2>
          <p className="text-2xl opacity-80 mb-12 font-medium max-w-2xl mx-auto">
            Put the method into practice. Free.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-20 px-12 text-xl font-black rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)]"
            >
              Get started free
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
