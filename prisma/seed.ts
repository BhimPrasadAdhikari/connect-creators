import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.purchase.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.digitalProduct.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.post.deleteMany();
  await prisma.subscriptionTier.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users (creators and fans)
  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create Creator 1 - Priya
  const priya = await prisma.user.create({
    data: {
      email: "priya@example.com",
      name: "Priya Sharma",
      password: hashedPassword,
      role: "CREATOR",
      image: null,
    },
  });

  const priyaProfile = await prisma.creatorProfile.create({
    data: {
      userId: priya.id,
      username: "priya_art",
      displayName: "Priya Sharma",
      bio: "Digital artist & content creator from Nepal 🇳🇵 Creating art that tells stories. Join my journey!",
      isVerified: true,
      socialLinks: {
        instagram: "https://instagram.com/priya_art",
        youtube: "https://youtube.com/@priyaart",
        twitter: "https://twitter.com/priya_art",
      },
    },
  });

  // Create Creator 2 - Amit
  const amit = await prisma.user.create({
    data: {
      email: "amit@example.com",
      name: "Amit Kumar",
      password: hashedPassword,
      role: "CREATOR",
    },
  });

  const amitProfile = await prisma.creatorProfile.create({
    data: {
      userId: amit.id,
      username: "tech_amit",
      displayName: "Amit Kumar",
      bio: "Teaching web development & programming tips 💻 10+ years in tech. Let's learn together!",
      isVerified: true,
      socialLinks: {
        youtube: "https://youtube.com/@techwithamit",
        github: "https://github.com/amitkumar",
      },
    },
  });

  // Create Creator 3 - Riya
  const riya = await prisma.user.create({
    data: {
      email: "riya@example.com",
      name: "Riya Thapa",
      password: hashedPassword,
      role: "CREATOR",
    },
  });

  const riyaProfile = await prisma.creatorProfile.create({
    data: {
      userId: riya.id,
      username: "riya_fitness",
      displayName: "Riya Thapa",
      bio: "Your personal fitness coach 💪 Transform your body and mind with my workout plans!",
      isVerified: false,
      socialLinks: {
        instagram: "https://instagram.com/riya_fitness",
      },
    },
  });

  // Create Creator 4 - Sameer
  const sameer = await prisma.user.create({
    data: {
      email: "sameer@example.com",
      name: "Sameer Shah",
      password: hashedPassword,
      role: "CREATOR",
    },
  });

  const sameerProfile = await prisma.creatorProfile.create({
    data: {
      userId: sameer.id,
      username: "sameer_music",
      displayName: "Sameer Shah",
      bio: "Singer, songwriter, and music producer 🎵 Original Nepali music & covers.",
      isVerified: true,
      socialLinks: {
        spotify: "https://spotify.com/artist/sameershah",
        youtube: "https://youtube.com/@sameermusic",
      },
    },
  });

  // Create Fan users
  const fan1 = await prisma.user.create({
    data: {
      email: "fan1@example.com",
      name: "Rahul Verma",
      password: hashedPassword,
      role: "FAN",
    },
  });

  const fan2 = await prisma.user.create({
    data: {
      email: "fan2@example.com",
      name: "Sita Kumari",
      password: hashedPassword,
      role: "FAN",
    },
  });

  console.log("✅ Created 4 creators and 2 fans");

  // Create Subscription Tiers
  console.log("\nCreating subscription tiers...");

  // Priya's tiers
  const priyaTier1 = await prisma.subscriptionTier.create({
    data: {
      creatorId: priyaProfile.id,
      name: "Supporter",
      description: "Get access to my exclusive art process and behind-the-scenes content.",
      price: 9900, // ₹99
      currency: "INR",
      benefits: [
        "Access to all public posts",
        "Behind-the-scenes content",
        "Monthly art wallpapers",
        "Early access to new work",
      ],
    },
  });

  const priyaTier2 = await prisma.subscriptionTier.create({
    data: {
      creatorId: priyaProfile.id,
      name: "Art Lover",
      description: "Everything in Supporter + exclusive tutorials and live sessions.",
      price: 19900, // ₹199
      currency: "INR",
      benefits: [
        "All Supporter benefits",
        "Exclusive art tutorials",
        "Monthly live art sessions",
        "Personal feedback on your art",
        "Discord community access",
      ],
    },
  });

  const _priyaTier3 = await prisma.subscriptionTier.create({
    data: {
      creatorId: priyaProfile.id,
      name: "Premium Artist",
      description: "The ultimate experience with 1-on-1 mentoring and custom art.",
      price: 49900, // ₹499
      currency: "INR",
      benefits: [
        "All Art Lover benefits",
        "Monthly 1-on-1 mentoring call",
        "Custom art piece every 3 months",
        "Priority commissions",
        "Name in video credits",
      ],
    },
  });

  // Amit's tiers
  const amitTier1 = await prisma.subscriptionTier.create({
    data: {
      creatorId: amitProfile.id,
      name: "Code Beginner",
      description: "Start your coding journey with beginner-friendly tutorials.",
      price: 14900, // ₹149
      currency: "INR",
      benefits: [
        "Access to beginner tutorials",
        "Code snippets library",
        "Monthly Q&A sessions",
        "Community forum access",
      ],
    },
  });

  const amitTier2 = await prisma.subscriptionTier.create({
    data: {
      creatorId: amitProfile.id,
      name: "Pro Developer",
      description: "Advanced content, project tutorials, and code reviews.",
      price: 29900, // ₹299
      currency: "INR",
      benefits: [
        "All beginner content",
        "Advanced project tutorials",
        "Source code for all projects",
        "Weekly code reviews",
        "Resume review",
      ],
    },
  });

  // Riya's tiers
  const riyaTier1 = await prisma.subscriptionTier.create({
    data: {
      creatorId: riyaProfile.id,
      name: "Fitness Basic",
      description: "Start your fitness journey with weekly workout plans.",
      price: 9900, // ₹99
      currency: "INR",
      benefits: [
        "Weekly workout plans",
        "Exercise video library",
        "Nutrition tips",
        "Community support group",
      ],
    },
  });

  const riyaTier2 = await prisma.subscriptionTier.create({
    data: {
      creatorId: riyaProfile.id,
      name: "Transformation",
      description: "Complete transformation program with personalized guidance.",
      price: 39900, // ₹399
      currency: "INR",
      benefits: [
        "Custom workout plans",
        "Personalized diet plans",
        "Weekly check-ins",
        "Progress tracking",
        "24/7 WhatsApp support",
      ],
    },
  });

  // Sameer's tiers  
  const sameerTier1 = await prisma.subscriptionTier.create({
    data: {
      creatorId: sameerProfile.id,
      name: "Music Fan",
      description: "Support my music and get early access to new releases.",
      price: 9900, // ₹99
      currency: "INR",
      benefits: [
        "Early access to new songs",
        "Behind-the-scenes studio content",
        "Monthly live acoustic sessions",
        "Exclusive unreleased tracks",
      ],
    },
  });

  console.log("✅ Created subscription tiers for all creators");

  // Create Posts
  console.log("\nCreating posts...");

  // Priya's posts
  await prisma.post.create({
    data: {
      creatorId: priyaProfile.id,
      title: "My Art Journey - 5 Years of Growth",
      content: "Looking back at how far I've come as an artist. From struggling to draw basic shapes to creating digital masterpieces. Here's my story and the lessons I've learned along the way. Never give up on your creative dreams! 🎨",
      isPaid: false,
      isPublished: true,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: priyaProfile.id,
      title: "Exclusive Tutorial: Digital Portrait Masterclass",
      content: "In this exclusive tutorial, I'll walk you through my complete process for creating realistic digital portraits. From initial sketch to final rendering, learn all my secrets! This is my most comprehensive tutorial yet.",
      isPaid: true,
      requiredTierId: priyaTier2.id,
      isPublished: true,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: priyaProfile.id,
      title: "January Art Challenge - Join Me!",
      content: "I'm starting a 30-day art challenge and I want YOU to join! Every day, I'll post a new prompt and we'll create together. Let's grow our skills as a community! 💪🎨",
      isPaid: false,
      isPublished: true,
    },
  });

  // Amit's posts
  await prisma.post.create({
    data: {
      creatorId: amitProfile.id,
      title: "React 19 - What's New and Exciting",
      content: "React 19 brings some amazing new features! Let me break down the React Compiler, new hooks, and all the improvements you need to know about. This is going to change how we build React apps!",
      isPaid: false,
      isPublished: true,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: amitProfile.id,
      title: "Build a Full-Stack App with Next.js 15",
      content: "Complete project tutorial: We'll build a production-ready SaaS application from scratch using Next.js 15, Prisma, PostgreSQL, and Stripe. Includes authentication, payments, and deployment!",
      isPaid: true,
      requiredTierId: amitTier2.id,
      isPublished: true,
    },
  });

  // Riya's posts
  await prisma.post.create({
    data: {
      creatorId: riyaProfile.id,
      title: "Start Your Fitness Journey Today",
      content: "New year, new you! Whether you're a complete beginner or getting back into fitness, this post will help you create sustainable habits. Small steps lead to big changes! 💪",
      isPaid: false,
      isPublished: true,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: riyaProfile.id,
      title: "My Complete Home Workout Routine",
      content: "No gym? No problem! Here's my full home workout routine that requires zero equipment. Perfect for busy schedules. Watch the videos and follow along!",
      isPaid: true,
      requiredTierId: riyaTier1.id,
      isPublished: true,
    },
  });

  // Sameer's posts
  await prisma.post.create({
    data: {
      creatorId: sameerProfile.id,
      title: "New Song Coming Next Week! 🎵",
      content: "I've been working on something special for the past 3 months. It's my most personal song yet, about home, memories, and the journey of life. Can't wait to share it with you all!",
      isPaid: false,
      isPublished: true,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: sameerProfile.id,
      title: "Exclusive: Unreleased Track Preview",
      content: "Here's an exclusive preview of my upcoming album! Supporters get early access to this unreleased track. Let me know what you think in the comments!",
      isPaid: true,
      requiredTierId: sameerTier1.id,
      isPublished: true,
    },
  });

  console.log("✅ Created posts for all creators");

  // Create Digital Products
  console.log("\nCreating digital products...");

  // Priya's digital products
  await prisma.digitalProduct.create({
    data: {
      creatorId: priyaProfile.id,
      title: "Complete Procreate Brush Pack",
      description: "50+ custom brushes I use in all my digital art. Includes texture, line, and shading brushes.",
      price: 49900, // ₹499
      fileUrl: "https://example.com/files/priya-brushes.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: priyaProfile.id,
      title: "Digital Portrait Drawing eBook",
      description: "Learn my step-by-step process for creating realistic digital portraits. 80+ pages with tutorials.",
      price: 29900, // ₹299
      fileUrl: "https://example.com/files/priya-ebook.pdf",
      fileType: "pdf",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: priyaProfile.id,
      title: "Custom Wallpaper Pack (12 designs)",
      description: "My best artwork as high-resolution wallpapers for desktop and mobile.",
      price: 9900, // ₹99
      fileUrl: "https://example.com/files/priya-wallpapers.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  // Amit's digital products
  await prisma.digitalProduct.create({
    data: {
      creatorId: amitProfile.id,
      title: "React Component Library Starter",
      description: "Production-ready component library setup with TypeScript, Storybook, and automated testing.",
      price: 99900, // ₹999
      fileUrl: "https://example.com/files/amit-component-lib.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: amitProfile.id,
      title: "Next.js SaaS Boilerplate",
      description: "Complete SaaS starter with auth, payments, admin dashboard, and more. Save weeks of development!",
      price: 199900, // ₹1999
      fileUrl: "https://example.com/files/amit-saas-boilerplate.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: amitProfile.id,
      title: "Web Developer Interview Guide",
      description: "100+ common interview questions with detailed answers for frontend and fullstack roles.",
      price: 29900, // ₹299
      fileUrl: "https://example.com/files/amit-interview-guide.pdf",
      fileType: "pdf",
      isActive: true,
    },
  });

  // Riya's digital products
  await prisma.digitalProduct.create({
    data: {
      creatorId: riyaProfile.id,
      title: "12-Week Transformation Program",
      description: "Complete workout and nutrition plan to transform your body. Includes video guides.",
      price: 149900, // ₹1499
      fileUrl: "https://example.com/files/riya-12week.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: riyaProfile.id,
      title: "Home Workout Video Pack",
      description: "30 follow-along workout videos, no equipment needed. From beginner to advanced.",
      price: 79900, // ₹799
      fileUrl: "https://example.com/files/riya-home-videos.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: riyaProfile.id,
      title: "Healthy Indian Recipe eBook",
      description: "50+ healthy Indian recipes with macros. Perfect for fitness enthusiasts.",
      price: 19900, // ₹199
      fileUrl: "https://example.com/files/riya-recipes.pdf",
      fileType: "pdf",
      isActive: true,
    },
  });

  // Sameer's digital products
  await prisma.digitalProduct.create({
    data: {
      creatorId: sameerProfile.id,
      title: "Original Song Stems Pack",
      description: "Complete stems and instrumentals for 5 of my original songs. Use for remixes or covers!",
      price: 49900, // ₹499
      fileUrl: "https://example.com/files/sameer-stems.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: sameerProfile.id,
      title: "Music Production Sample Pack",
      description: "200+ royalty-free samples: drums, synths, vocals. Created for Nepali music production.",
      price: 39900, // ₹399
      fileUrl: "https://example.com/files/sameer-samples.zip",
      fileType: "zip",
      isActive: true,
    },
  });

  await prisma.digitalProduct.create({
    data: {
      creatorId: sameerProfile.id,
      title: "Guitar Chord Book (Nepali Songs)",
      description: "Chord charts and strumming patterns for 100+ popular Nepali songs.",
      price: 14900, // ₹149
      fileUrl: "https://example.com/files/sameer-chords.pdf",
      fileType: "pdf",
      isActive: true,
    },
  });

  console.log("✅ Created digital products for all creators");

  // Create some subscriptions
  console.log("\nCreating subscriptions...");

  await prisma.subscription.create({
    data: {
      fanId: fan1.id,
      tierId: priyaTier1.id,
      creatorId: priyaProfile.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.subscription.create({
    data: {
      fanId: fan1.id,
      tierId: amitTier1.id,
      creatorId: amitProfile.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      fanId: fan2.id,
      tierId: priyaTier2.id,
      creatorId: priyaProfile.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Created sample subscriptions");

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Test accounts created:");
  console.log("   Creators:");
  console.log("   - priya@example.com / password123 (username: priya_art)");
  console.log("   - amit@example.com / password123 (username: tech_amit)");
  console.log("   - riya@example.com / password123 (username: riya_fitness)");
  console.log("   - sameer@example.com / password123 (username: sameer_music)");
  console.log("   Fans:");
  console.log("   - fan1@example.com / password123");
  console.log("   - fan2@example.com / password123");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
