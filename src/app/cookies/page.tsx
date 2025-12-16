import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Cookie Policy | CreatorConnect",
  description: "Learn how CreatorConnect uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: December 2024</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-600">
                Cookies are small text files stored on your device when you visit websites. 
                They help websites remember your preferences and improve your experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Essential Cookies</h3>
              <p className="text-gray-600 mb-4">
                Required for the website to function. They enable core features like 
                authentication and security.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Analytics Cookies</h3>
              <p className="text-gray-600 mb-4">
                Help us understand how visitors interact with our website, allowing us to 
                improve our services.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Preference Cookies</h3>
              <p className="text-gray-600 mb-4">
                Remember your settings and preferences like language and theme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600">
                Our payment partners may set cookies for fraud prevention and security purposes. 
                These are governed by their respective privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-600 mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Block all cookies</li>
                <li>Delete existing cookies</li>
                <li>Allow cookies from specific sites</li>
                <li>Set preferences for different types of cookies</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Note: Blocking essential cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                Questions about our cookie policy? Contact us at{" "}
                <a href="mailto:privacy@creatorconnect.com" className="text-blue-600 hover:underline">
                  privacy@creatorconnect.com
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
