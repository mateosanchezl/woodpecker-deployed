import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Peck",
  description: "Privacy Policy and GDPR information for Peck chess training",
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-12">Last Updated: 28 December 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Peck ("we" or "us") operates in compliance with UK GDPR and the Data Protection Act 2018. This policy explains how we handle your personal data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Data Controller</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">
          <strong>Peck</strong>, United Kingdom<br />
          Contact: <a href="mailto:dwyc.co@gmail.com" className="text-primary hover:underline">dwyc.co@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Account:</strong> Email, name</li>
          <li><strong>Training:</strong> Puzzle attempts, progress, ratings, streaks, achievements</li>
          <li><strong>Technical:</strong> Browser info, IP address, error logs, analytics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Provide chess training service</li>
          <li>Track your progress and statistics</li>
          <li>Improve service quality</li>
          <li>Fix technical issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Third-Party Services</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          We use these services to operate Peck:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Clerk</strong> (US): Authentication</li>
          <li><strong>Vercel</strong> (US): Hosting and analytics</li>
          <li><strong>Sentry</strong> (US/Germany): Error monitoring</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-3">
          Data transfers to the US are protected by Standard Contractual Clauses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Cookies</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Essential:</strong> Required for authentication and core functionality</li>
          <li><strong>Analytics:</strong> Vercel Analytics for usage insights</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Data Retention</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Active accounts: Data retained while account is active</li>
          <li>Deleted accounts: 30-day recovery period, then permanent deletion</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Under UK GDPR, you have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion</li>
          <li>Restrict processing</li>
          <li>Data portability</li>
          <li>Object to processing</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          To exercise these rights, email <a href="mailto:dwyc.co@gmail.com" className="text-primary hover:underline">dwyc.co@gmail.com</a>. We'll respond within 30 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use encryption, access controls, and regular security monitoring to protect your data. However, no internet transmission is completely secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">Complaints</h2>
        <p className="text-muted-foreground leading-relaxed">
          You can lodge a complaint with the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Information Commissioner's Office (ICO)</a> at ico.org.uk or call 0303 123 1113.
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
