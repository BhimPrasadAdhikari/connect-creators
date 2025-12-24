// Secure Download API
// Validates download tokens and serves files securely

import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/downloads/tokens";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Download token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const verification = verifyDownloadToken(token);
    
    if (!verification.valid || !verification.data) {
      console.log("[Download] Invalid token:", verification.error);
      return NextResponse.json(
        { error: verification.error || "Invalid download link" },
        { status: 401 }
      );
    }

    const { purchaseId, productId, userId } = verification.data;

    // Verify purchase exists and is completed
    const purchase = await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        productId: productId,
        userId: userId,
        status: "COMPLETED",
      },
      include: {
        product: true,
      },
    });

    if (!purchase) {
      console.log("[Download] Purchase not found or not completed:", { purchaseId, productId, userId });
      return NextResponse.json(
        { error: "Purchase not found or not yet completed" },
        { status: 404 }
      );
    }

    if (!purchase.product) {
      return NextResponse.json(
        { error: "Product no longer available" },
        { status: 404 }
      );
    }

    // Log the download for tracking
    console.log(`[Download] User ${userId} downloading product ${productId} (purchase ${purchaseId})`);

    // Check if it's an external URL or internal file
    const fileUrl = purchase.product.fileUrl;

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      // External URL - redirect to it (with some added security headers)
      // In production, you might want to proxy this through your server
      return NextResponse.redirect(fileUrl, {
        headers: {
          "X-Download-Token": "verified",
          "Cache-Control": "no-store, must-revalidate",
        },
      });
    }

    // For internal files, you would stream the file here
    // This is a placeholder - implement based on your file storage
    return NextResponse.json({
      success: true,
      message: "Download authorized",
      fileUrl: fileUrl, // In production, stream the file instead
      product: {
        title: purchase.product.title,
        fileType: purchase.product.fileType,
      },
    });
  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
