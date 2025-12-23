import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CreatorConnect | Support Creators You Love",
  description:
    "Join exclusive communities, content, and live interactions from micro-influencers across Nepal & India. Subscribe for ₹99-₹299/month.",
  keywords: [
    "creators",
    "influencers",
    "subscription",
    "content",
    "Nepal",
    "India",
    "community",
  ],
  openGraph: {
    title: "CreatorConnect | Support Creators You Love",
    description:
      "Join exclusive communities and premium content from your favorite creators.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
