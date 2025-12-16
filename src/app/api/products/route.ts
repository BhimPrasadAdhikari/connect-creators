import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/products - List digital products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: { creatorId?: string; isActive: boolean } = {
      isActive: true,
    };

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const products = await prisma.digitalProduct.findMany({
      where,
      include: {
        creator: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { purchases: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products - Create a digital product (creator only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Only creators can create products" }, { status: 403 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, price, fileUrl, fileType, thumbnailUrl } = body;

    if (!title || !price || !fileUrl) {
      return NextResponse.json(
        { error: "Title, price, and file URL are required" },
        { status: 400 }
      );
    }

    if (price < 4900) {
      return NextResponse.json({ error: "Minimum price is ₹49" }, { status: 400 });
    }

    const product = await prisma.digitalProduct.create({
      data: {
        creatorId: creator.id,
        title,
        description,
        price,
        fileUrl,
        fileType,
        thumbnailUrl,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
