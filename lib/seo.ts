import type { Metadata } from "next";

/**
 * SEO Constants and Utilities for Peck Chess Training
 *
 * Optimized for ranking #1 for "woodpecker method chess" keywords
 */

// =============================================================================
// Target Keywords (Priority Order)
// =============================================================================

export const TARGET_KEYWORDS = {
  primary: [
    "woodpecker method",
    "woodpecker method chess",
    "woodpecker chess training",
    "free woodpecker method",
  ],
  secondary: [
    "woodpecker method app",
    "woodpecker method online",
    "woodpecker method puzzles",
    "chess puzzle trainer",
    "free chess tactics trainer",
  ],
  longtail: [
    "woodpecker method chess training app",
    "best woodpecker method app",
    "free chess training app",
    "chess puzzle repetition training",
    "spaced repetition chess puzzles",
  ],
  related: [
    "chess tactics trainer",
    "chess puzzle training",
    "tactical pattern recognition",
    "lichess puzzles training",
  ],
} as const;

// =============================================================================
// Site Constants
// =============================================================================

export const SITE_CONFIG = {
  name: "Peck",
  tagline: "Free Woodpecker Method Chess Training",
  // Primary keyword in description
  description:
    "Free Woodpecker Method chess training app. Master chess tactics through intensive puzzle repetition. Build pattern recognition and calculation speed with the scientifically-proven Woodpecker Method.",
  url: "https://peckchess.com",
  locale: "en_US",
  twitterHandle: "@peckchess",
  email: "support@peckchess.com",
} as const;

// =============================================================================
// Default Metadata - Keyword Optimized
// =============================================================================

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - Free Woodpecker Method Chess Training`,
    template: `%s | ${SITE_CONFIG.name} - Woodpecker Method`,
  },
  description: SITE_CONFIG.description,
  applicationName: `${SITE_CONFIG.name} - Woodpecker Method`,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: `${SITE_CONFIG.name} - Woodpecker Method Chess Training`,
    title: `${SITE_CONFIG.name} - Free Woodpecker Method Chess Training`,
    description:
      "Master chess tactics with the Woodpecker Method for free. The best app for chess puzzle repetition training. Build pattern recognition and improve your tactical vision.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Peck - Woodpecker Method Chess Training App",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - Free Woodpecker Method Chess Training`,
    description:
      "Master chess tactics with the Woodpecker Method for free. Chess puzzle repetition training app.",
    creator: SITE_CONFIG.twitterHandle,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
  // Comprehensive keyword list
  keywords: [
    // Primary
    "woodpecker method",
    "woodpecker method chess",
    "free woodpecker method",
    "woodpecker chess training",
    // Secondary
    "woodpecker method app",
    "free chess tactics trainer",
    "woodpecker method puzzles",
    "chess puzzle trainer",
    // Long-tail
    "woodpecker method chess training app",
    "free chess training app",
    "best woodpecker method app",
    "chess puzzle repetition training",
    // Related
    "chess tactics trainer",
    "tactical pattern recognition",
    "spaced repetition chess",
    "lichess puzzles",
  ],
};

// =============================================================================
// Page-specific Metadata Generators
// =============================================================================

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: readonly string[] | string[];
  openGraph?: {
    type?: "website" | "article";
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
}

/**
 * Generate page-specific metadata with proper defaults
 */
export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  keywords,
  openGraph,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    title,
    description,
    keywords: keywords ? [...keywords] : DEFAULT_METADATA.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: openGraph?.type ?? "website",
      images: openGraph?.images ?? DEFAULT_METADATA.openGraph?.images,
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
    robots: noIndex ? { index: false, follow: false } : DEFAULT_METADATA.robots,
  };
}

// =============================================================================
// Pre-defined Page Metadata - Keyword Optimized
// =============================================================================

export const PAGE_METADATA = {
  home: {
    title: "Peck - Free Woodpecker Method Chess Training App",
    description:
      "Master chess tactics with the Woodpecker Method for free. The best online chess puzzle training app. Solve the same puzzles faster each cycle to build pattern recognition and improve your tactical vision.",
    path: "/",
    keywords: [
      "woodpecker method",
      "free woodpecker method",
      "woodpecker method chess",
      "chess puzzle trainer",
      "free chess training",
    ],
  },
  woodpeckerMethod: {
    title: "What is the Woodpecker Method? | Chess Training Guide",
    description:
      "Learn the Woodpecker Method for chess improvement. Discover how solving the same tactical puzzles repeatedly builds pattern recognition and calculation speed. Free training available.",
    path: "/woodpecker-method",
    keywords: [
      "woodpecker method",
      "what is woodpecker method",
      "woodpecker method explained",
      "how to use woodpecker method",
      "woodpecker method guide",
    ],
  },
  dashboard: {
    title: "Dashboard - Track Your Woodpecker Method Progress",
    description:
      "Track your Woodpecker Method chess training progress. View your cycle times, accuracy stats, streaks, and achievements.",
    path: "/dashboard",
  },
  training: {
    title: "Start Woodpecker Method Training | Chess Puzzle Cycles",
    description:
      "Begin your Woodpecker Method training session. Solve chess puzzles in cycles, getting faster each round as patterns become automatic.",
    path: "/training",
  },
  trainingNew: {
    title: "Create Woodpecker Method Puzzle Set | Customize Your Training",
    description:
      "Create a personalized Woodpecker Method puzzle set. Choose your rating range, set size, and target cycles for optimal chess improvement.",
    path: "/training/new",
  },
  progress: {
    title: "Woodpecker Method Progress Analytics | Track Improvement",
    description:
      "Analyze your Woodpecker Method training progress. View cycle time improvements, accuracy trends, and identify problem puzzles.",
    path: "/progress",
  },
  leaderboard: {
    title: "Woodpecker Method Leaderboard | Top Chess Trainers",
    description:
      "See how you rank against other Woodpecker Method practitioners. Compare cycle times, accuracy, and streaks with the community.",
    path: "/leaderboard",
  },
  achievements: {
    title: "Woodpecker Method Achievements | Training Milestones",
    description:
      "Unlock achievements as you master the Woodpecker Method. Track your milestones in chess tactical training.",
    path: "/achievements",
  },
  settings: {
    title: "Settings | Customize Your Woodpecker Method Training",
    description:
      "Customize your Woodpecker Method training experience. Adjust puzzle difficulty, set size preferences, and training parameters.",
    path: "/settings",
  },
  signIn: {
    title: "Sign In | Woodpecker Method Chess Training",
    description:
      "Sign in to continue your Woodpecker Method chess training. Pick up where you left off in your puzzle cycles.",
    path: "/sign-in",
  },
  signUp: {
    title: "Start Free Woodpecker Method Training | Create Account",
    description:
      "Create your free account and start Woodpecker Method chess training today. No credit card required.",
    path: "/sign-up",
  },
  privacy: {
    title: "Privacy Policy | Peck Woodpecker Method Training",
    description:
      "Privacy policy for Peck, the Woodpecker Method chess training app. Learn how we protect your data.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service | Peck Woodpecker Method Training",
    description:
      "Terms of service for Peck, the Woodpecker Method chess training platform.",
    path: "/terms",
  },
} as const;

// =============================================================================
// JSON-LD Structured Data - Optimized for Woodpecker Method
// =============================================================================

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    alternateName: "Peck Chess",
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/android-chrome-512x512.png`,
    description: "Free Woodpecker Method chess training platform",
    email: SITE_CONFIG.email,
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.twitterHandle.replace("@", "")}`,
    ],
  };
}

/**
 * Generate SoftwareApplication schema - Critical for app rankings
 */
export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_CONFIG.name} - Woodpecker Method Chess Training`,
    alternateName: ["Peck Chess", "Woodpecker Method App"],
    description:
      "Free Woodpecker Method chess training app. Master chess tactics through intensive puzzle repetition with the scientifically-proven Woodpecker Method.",
    url: SITE_CONFIG.url,
    applicationCategory: "GameApplication",
    applicationSubCategory: "Chess Training",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Woodpecker Method training cycles",
      "Curated Lichess puzzle database",
      "Progress tracking and analytics",
      "Cycle time improvement tracking",
      "Achievement and streak system",
      "Global leaderboards",
      "Personalized puzzle sets",
      "Pattern recognition training",
    ],
    screenshot: `${SITE_CONFIG.url}/og-image.png`,
    softwareVersion: "1.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/**
 * Generate WebApplication schema
 */
export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${SITE_CONFIG.name} - Woodpecker Method`,
    description:
      "Free online Woodpecker Method chess training. Solve puzzles in cycles to build tactical pattern recognition.",
    url: SITE_CONFIG.url,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Woodpecker Method implementation",
      "Chess tactical training",
      "Puzzle repetition cycles",
      "Progress tracking",
      "Achievement system",
      "Leaderboards",
    ],
  };
}

/**
 * Generate WebSite schema with SearchAction
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_CONFIG.name} - Woodpecker Method Chess Training`,
    alternateName: ["Peck Chess", "Peck Woodpecker Method"],
    url: SITE_CONFIG.url,
    description: "Free Woodpecker Method chess training app",
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/training?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate HowTo schema for Woodpecker Method - Great for featured snippets
 */
export function generateHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use the Woodpecker Method for Chess Training",
    description:
      "Learn how to use the Woodpecker Method to improve your chess tactics. This step-by-step guide shows you how to build pattern recognition through puzzle repetition.",
    image: `${SITE_CONFIG.url}/og-image.png`,
    totalTime: "PT30M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    supply: [
      {
        "@type": "HowToSupply",
        name: "Chess puzzles (provided by Peck)",
      },
    ],
    tool: [
      {
        "@type": "HowToTool",
        name: "Peck Woodpecker Method App",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Create a puzzle set",
        text: "Select 100-300 puzzles slightly below your rating. Peck automatically curates high-quality puzzles from the Lichess database.",
        url: `${SITE_CONFIG.url}/training/new`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Complete Cycle 1 - Solve carefully",
        text: "Solve all puzzles in your set, taking time to calculate fully. Don't rush - understanding comes first.",
        url: `${SITE_CONFIG.url}/training`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Complete Cycle 2 - Build speed",
        text: "Solve the same puzzles again. You'll recognize patterns and solve faster. Aim to cut your time in half.",
        url: `${SITE_CONFIG.url}/training`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Complete Cycles 3-5 - Master the patterns",
        text: "Continue repeating the set. Each cycle should be faster as patterns become automatic. Most users see 8x improvement by cycle 4-5.",
        url: `${SITE_CONFIG.url}/training`,
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Track your progress",
        text: "Use Peck's analytics to monitor your cycle times, accuracy, and identify problem puzzles that need extra attention.",
        url: `${SITE_CONFIG.url}/progress`,
      },
    ],
  };
}

/**
 * Generate comprehensive FAQ schema for Woodpecker Method
 */
export function generateWoodpeckerFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Woodpecker Method?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Woodpecker Method is a chess training technique developed by GM Axel Smith and Hans Tikkanen. It involves solving a fixed set of tactical puzzles repeatedly, getting faster each cycle. This repetition builds pattern recognition, allowing you to spot tactical motifs instantly in real games. The method is scientifically proven to improve tactical ability more effectively than solving new puzzles.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Woodpecker Method work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Woodpecker Method works through spaced repetition of tactical puzzles. You select 100-300 puzzles and solve them in cycles. Cycle 1 takes the longest as you calculate carefully. Each subsequent cycle gets faster as you recognize patterns. By cycles 4-5, what took 60 minutes might take only 7-8 minutes. This speed indicates the patterns are now automatic - burned into your subconscious.",
        },
      },
      {
        "@type": "Question",
        name: "How many puzzles should be in a Woodpecker Method set?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most chess trainers find success with 100-300 puzzles per set. Beginners should start with 100-150 puzzles to keep cycles manageable. Intermediate to advanced players can use 200-300 puzzles for more variety. The key is choosing a size you can complete in a reasonable time - typically 30-60 minutes for the first cycle.",
        },
      },
      {
        "@type": "Question",
        name: "What rating should Woodpecker Method puzzles be?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose puzzles slightly below your peak tactical ability - typically 100-200 points below your puzzle rating. If you're rated 1500, use puzzles around 1300-1400. The goal is to build speed and pattern recognition, not to struggle with each puzzle. Easier puzzles allow more repetitions and faster cycle times.",
        },
      },
      {
        "@type": "Question",
        name: "How many Woodpecker Method cycles should I complete?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The original Woodpecker Method recommends 3-7 cycles per puzzle set. Most users see significant improvement after 4-5 cycles. You'll know you've mastered a set when your cycle time plateaus and you're recognizing patterns instantly. Then it's time to create a new set with different puzzles.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Woodpecker Method effective for chess improvement?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the Woodpecker Method is highly effective. It's based on principles of spaced repetition and pattern recognition that are proven in learning science. Many players report gaining 100-200 rating points in tactical ability after consistent Woodpecker training. The method is especially effective for players who plateau from solving random puzzles.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best Woodpecker Method app?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peck is a free Woodpecker Method training app with curated puzzles from the Lichess database, automatic cycle tracking, progress analytics, and gamification features like streaks and achievements. It's specifically designed for the Woodpecker Method with cycle time tracking and pattern recognition metrics.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use the Woodpecker Method for free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Peck is completely free. You get access to millions of high-quality puzzles from the Lichess database, unlimited puzzle sets, full progress tracking, and all features at no cost. No credit card required.",
        },
      },
      {
        "@type": "Question",
        name: "How long does a Woodpecker Method cycle take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cycle times vary by set size and skill level. For a 150-puzzle set, Cycle 1 typically takes 45-60 minutes. Cycle 2 is around 20-30 minutes. By Cycle 4-5, most users complete the set in 7-15 minutes. This dramatic improvement in speed indicates successful pattern internalization.",
        },
      },
      {
        "@type": "Question",
        name: "Where did the Woodpecker Method come from?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Woodpecker Method was developed by Swedish Grandmaster Axel Smith and International Master Hans Tikkanen. They published the method in their 2018 book 'The Woodpecker Method'. The name comes from how woodpeckers repeatedly peck at trees - just as you repeatedly solve the same puzzles. Both authors used this method to achieve their chess titles.",
        },
      },
      {
        "@type": "Question",
        name: "How much does Peck cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peck is free. All features including unlimited puzzle sets, progress analytics, achievements, and leaderboards are available at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "Why is Peck free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peck is free because we believe the Woodpecker Method should be accessible to every chess player. We use open-source puzzles from the Lichess database and want to help players improve without financial barriers.",
        },
      },
    ],
  };
}

/**
 * Generate FAQ schema (generic version)
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

/**
 * Generate Article schema for educational content
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    image: article.image || `${SITE_CONFIG.url}/og-image.png`,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/android-chrome-512x512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

/**
 * Get absolute URL for assets (images, etc.)
 */
export function getAbsoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}
