import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.signUp,
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="sr-only">Create your Peck account</h1>
      <SignUp afterSignUpUrl="/training?quickstart=1" />
    </main>
  );
}
