import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.signIn,
  noIndex: true,
});

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="sr-only">Sign in to Peck</h1>
      <SignIn />
    </main>
  );
}
