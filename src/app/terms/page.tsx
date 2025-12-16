import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service | CreatorConnect",
  description: "Read the terms and conditions for using CreatorConnect.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: December 2024</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing or using CreatorConnect, you agree to be bound by these Terms of Service. 
                If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account Registration</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may only maintain one account</li>
                <li>Provide accurate and complete information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Creator Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide content as described in your subscription tiers</li>
                <li>Do not post illegal, harmful, or misleading content</li>
                <li>Respect intellectual property rights</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Pay applicable taxes on your earnings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscriber Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Do not share or redistribute paid content</li>
                <li>Respect creators and other community members</li>
                <li>Do not engage in harassment or abuse</li>
                <li>Provide valid payment information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payments and Fees</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>CreatorConnect charges a 10% platform fee on creator earnings</li>
                <li>Payments are processed monthly</li>
                <li>Refunds are handled on a case-by-case basis</li>
                <li>Chargebacks may result in account suspension</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Content</h2>
              <p className="text-gray-600 mb-4">The following content is strictly prohibited:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Illegal content or activities</li>
                <li>Content exploiting minors</li>
                <li>Harassment, hate speech, or threats</li>
                <li>Spam or misleading content</li>
                <li>Malware or harmful code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600">
                We may suspend or terminate accounts that violate these terms. 
                You may delete your account at any time from your settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600">
                CreatorConnect is provided "as is" without warranties. We are not liable for 
                indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-600">
                Questions about these terms? Contact us at{" "}
                <a href="mailto:legal@creatorconnect.com" className="text-blue-600 hover:underline">
                  legal@creatorconnect.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
