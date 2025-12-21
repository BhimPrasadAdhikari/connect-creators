"use client";

import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

export default function StripeCancelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-gray-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made to your card.
          </p>

          <div className="space-y-3">
            <Link href="/explore" className="block">
              <Button variant="primary" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact our support team.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
