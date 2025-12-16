/**
 * Bank Transfer Payment Integration
 * Manual verification flow for direct bank transfers
 */

import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";
import prisma from "@/lib/prisma";

interface BankDetails {
  [key: string]: string | undefined;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode?: string; // For India
  branchCode?: string; // For Nepal
  swiftCode?: string; // For international
}

const PLATFORM_BANK_DETAILS: BankDetails = {
  bankName: process.env.BANK_NAME || "Your Bank Name",
  accountName: process.env.BANK_ACCOUNT_NAME || "CreatorConnect Pvt Ltd",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "XXXXXXXXXXXX",
  ifscCode: process.env.BANK_IFSC_CODE || "XXXX0000XXX",
};

export const bankTransferProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      // Create a pending payment record
      const payment = await prisma.payment.create({
        data: {
          userId: config.userId,
          subscriptionId: config.subscriptionId,
          amount: config.amount,
          currency: config.currency,
          provider: "BANK_TRANSFER",
          status: "PENDING",
          metadata: {
            ...config.metadata,
            bankDetails: PLATFORM_BANK_DETAILS,
            instructions: "Please transfer the amount to the bank account provided and upload the receipt.",
          },
        },
      });

      return {
        success: true,
        orderId: payment.id,
        // No redirect URL, frontend will show bank details
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bank transfer initiation failed";
      return {
        success: false,
        error: message,
      };
    }
  },

  async verifyPayment(orderId: string): Promise<PaymentVerification> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: orderId },
      });

      if (!payment) {
        return {
          success: false,
          orderId,
          paymentId: "",
          amount: 0,
          status: "failed",
        };
      }

      return {
        success: payment.status === "COMPLETED",
        orderId,
        paymentId: payment.providerPayId || orderId,
        amount: payment.amount,
        status: payment.status.toLowerCase() as "pending" | "completed" | "failed",
      };
    } catch (error) {
      return {
        success: false,
        orderId,
        paymentId: "",
        amount: 0,
        status: "failed",
      };
    }
  },

  async processWebhook(payload) {
    // Bank transfers are manually verified
    // This could be called by an admin API to mark payment as verified
    const { event, data } = payload;

    if (event === "manual_verification") {
      const orderId = data.orderId as string;
      const transactionId = data.transactionId as string;

      // Mark payment as completed
      await prisma.payment.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          providerPayId: transactionId,
        },
      });

      // Activate the subscription
      const payment = await prisma.payment.findUnique({
        where: { id: orderId },
        include: { subscription: true },
      });

      if (payment?.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
      }
    }
  },
};

/**
 * Get bank details for display
 */
export function getBankDetails(): BankDetails {
  return PLATFORM_BANK_DETAILS;
}

/**
 * Mark bank transfer as verified (admin function)
 */
export async function verifyBankTransfer(
  orderId: string,
  transactionId: string,
  adminNote?: string
): Promise<boolean> {
  try {
    await prisma.payment.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        providerPayId: transactionId,
        metadata: {
          verifiedAt: new Date().toISOString(),
          adminNote,
        },
      },
    });

    // Activate subscription
    const payment = await prisma.payment.findUnique({
      where: { id: orderId },
    });

    if (payment?.subscriptionId) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Bank transfer verification failed:", error);
    return false;
  }
}

export default bankTransferProvider;
