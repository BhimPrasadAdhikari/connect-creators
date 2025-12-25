
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Payout Verification...");

  // 1. Setup Mock Creator
  const email = `test-creator-${Date.now()}@example.com`;
  console.log(`Creating creator: ${email}`);
  
  const user = await prisma.user.create({
    data: {
      email,
      name: "Test Creator",
      role: "CREATOR",
      creatorProfile: {
        create: {
            username: `creator${Date.now()}`,
            displayName: "Test Creator Profile",
        }
      }
    },
    include: { creatorProfile: true }
  });
  
  const creatorId = user.creatorProfile.id;
  console.log(`Creator ID: ${creatorId}`);

  // 2. Add Earnings
  console.log("Adding mock earnings...");
  
  // A. Subscription Payment (100 INR)
  // Need a fan first
  const fan = await prisma.user.create({
      data: { email: `fan-${Date.now()}@example.com` }
  });

  // Create Tier
  const tier = await prisma.subscriptionTier.create({
      data: {
          creatorId,
          name: "Tier 1",
          price: 10000,
          benefits: ["test"]
      }
  });

  const sub = await prisma.subscription.create({
      data: {
          fanId: fan.id,
          creatorId,
          tierId: tier.id,
          status: "ACTIVE"
      }
  });

  await prisma.payment.create({
      data: {
          userId: fan.id,
          subscriptionId: sub.id,
          amount: 10000,
          provider: "STRIPE",
          status: "COMPLETED",
          creatorEarnings: 9000 // 90 INR earned
      }
  });

  console.log("  + 90.00 INR (Subscription)");

  // B. Tip (50 INR)
  await prisma.tip.create({
      data: {
          fromUserId: fan.id,
          toCreatorId: creatorId,
          amount: 5000, // 50 INR
          message: "Keep it up!"
      }
  });
  console.log("  + 50.00 INR (Tip)");

  // Total Expected Earnings: 140 INR (14000 paise)

  // 3. Test Balance Calculation
  // We can't call API directly easily without starting server or mocking Req/Res.
  // We will replicate logic here to verify DB state is correct for the query.
  
  const subscriptionEarnings = await prisma.payment.aggregate({
    where: { subscription: { creatorId }, status: "COMPLETED" },
    _sum: { creatorEarnings: true },
  });
  const tipEarnings = await prisma.tip.aggregate({
      where: { toCreatorId: creatorId },
      _sum: { amount: true }
  });

  const totalEarnings = (subscriptionEarnings._sum.creatorEarnings || 0) + (tipEarnings._sum.amount || 0);
  console.log(`Calculated Total Earnings: ${totalEarnings / 100} INR`);
  
  if (totalEarnings !== 14000) {
      console.error("FAIL: Earnings mismatch. Expected 14000");
  } else {
      console.log("PASS: Earnings match.");
  }

  // 4. Test Payout Method Creation
  console.log("Creating Payout Method...");
  const method = await prisma.payoutMethod.create({
      data: {
          creatorId,
          type: "UPI",
          details: { vpa: "test@upi" },
          isDefault: true
      }
  });
  console.log(`Method Created: ${method.id}`);

  // 5. Test Payout Request
  console.log("Requesting Payout (100 INR)...");
  
  // Available: 140
  // Request: 100
  // Remaining: 40
  
  const payout = await prisma.payout.create({
      data: {
          creatorId,
          amount: 10000,
          payoutMethodId: method.id,
          status: "PENDING"
      }
  });
  console.log(`Payout Requested: ${payout.id}`);

  // 6. Verify New Balance
  const totalPayouts = await prisma.payout.aggregate({
      where: {
          creatorId,
          status: { in: ["PENDING", "PROCESSING", "PAID"] }
      },
      _sum: { amount: true }
  });
  
  const paidOut = totalPayouts._sum.amount || 0;
  const availableBalance = totalEarnings - paidOut;
  
  console.log(`New Available Balance: ${availableBalance / 100} INR`);
  
  if (availableBalance !== 4000) {
      console.error("FAIL: Balance mismatch. Expected 4000");
  } else {
      console.log("PASS: Balance logic verified.");
  }

  // Cleanup
  console.log("Cleaning up...");
  await prisma.payout.deleteMany({ where: { creatorId } });
  await prisma.payoutMethod.deleteMany({ where: { creatorId } });
  await prisma.payment.deleteMany({ where: { subscription: { creatorId } } });
  await prisma.subscription.deleteMany({ where: { creatorId } }); // Cascade should handle this but explicit is safe
  await prisma.tip.deleteMany({ where: { toCreatorId: creatorId } });
  await prisma.creatorProfile.delete({ where: { id: creatorId } });
  await prisma.user.delete({ where: { email } });
  await prisma.user.delete({ where: { email: fan.email } });
  
  console.log("Done.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
