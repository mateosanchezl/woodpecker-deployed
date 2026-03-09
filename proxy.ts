import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/webhooks/clerk",
  "/api/cron/(.*)",
  "/privacy",
  "/terms",
  "/woodpecker-method",
  "/features",
  "/pricing",
  "/about",
  "/faq",
  "/blog(.*)",
  "/docs(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, crawl metadata, and static files.
    "/((?!_next|robots.txt|sitemap.xml|opengraph-image|llms.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
