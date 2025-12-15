import Link from "next/link";
import { Heart, CheckCircle, ArrowRight } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-text-primary">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Payment Successful!
            </h1>
            
            <p className="text-text-secondary mb-8">
              Thank you for your subscription. You now have access to exclusive content from your creator.
            </p>

            {/* Details */}
            <div className="bg-background rounded-lg p-4 mb-8 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Subscription</span>
                <span className="font-medium text-text-primary">Premium</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Amount</span>
                <span className="font-medium text-text-primary">₹199/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Next billing</span>
                <span className="font-medium text-text-primary">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button className="w-full" size="lg">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link 
                href="/explore" 
                className="block text-primary font-medium hover:underline"
              >
                Explore more creators
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
