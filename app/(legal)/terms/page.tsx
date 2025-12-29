import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Peck",
  description: "Terms and Conditions for using Peck chess training service",
};

export default function TermsPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Terms and Conditions</h1>
      <p className="text-sm text-muted-foreground mb-12">Last Updated: 28 December 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Agreement</h2>
        <p className="text-muted-foreground leading-relaxed">
          By using Peck, you agree to these terms. Peck provides chess tactical training using the Woodpecker Method with puzzles from the Lichess database.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Acceptable Use</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Violate any laws or regulations</li>
          <li>Attempt unauthorized access to our systems</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use automated tools to extract data</li>
          <li>Provide false information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Your Account</h2>
        <p className="text-muted-foreground leading-relaxed">
          You're responsible for maintaining account security and all activities under your account. Provide accurate information and keep your email current.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Intellectual Property</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Peck owns the platform, design, and code</li>
          <li>Chess puzzles are from Lichess (Creative Commons license)</li>
          <li>You own your training data</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Service Availability</h2>
        <p className="text-muted-foreground leading-relaxed">
          We don't guarantee uninterrupted service. We may modify features, perform maintenance, or make improvements at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          Peck is provided "as is" without warranties. We're not liable for indirect damages, data loss, or service interruptions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          You can close your account anytime. We may suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Changes</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update these terms. Material changes will be communicated via email or service notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These terms are governed by the laws of England and Wales. Disputes are subject to the jurisdiction of the courts of England and Wales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          Questions? Email <a href="mailto:dwyc.co@gmail.com" className="text-primary hover:underline">dwyc.co@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
