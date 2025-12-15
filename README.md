# CreatorConnect

A micro-influencer subscription platform connecting creators with their audience in South Asia (Nepal & India). Built with Next.js 16, TypeScript, Prisma, and multiple regional payment gateways.

## Overview

CreatorConnect enables content creators to monetize their work through tiered subscriptions while providing fans with exclusive access to premium content. The platform supports multiple payment methods including UPI, digital wallets (eSewa, Khalti), and international cards.

## Features

### For Creators
- **Profile Management**: Customizable profiles with bio, social links, and cover images
- **Tiered Subscriptions**: Create multiple subscription tiers with different pricing and benefits
- **Content Publishing**: Post both free and paid content with tier-based access control
- **Analytics Dashboard**: Track subscribers, earnings, and content performance
- **Multi-Currency Support**: Accept payments in INR and NPR

### For Fans
- **Creator Discovery**: Browse and search creators by category
- **Subscription Management**: Subscribe to multiple creators with different tiers
- **Personalized Feed**: Content feed from subscribed creators
- **Multiple Payment Options**: Pay via UPI, cards, eSewa, Khalti, or bank transfer

### Platform Features
- **Authentication**: Email/password and Google OAuth via NextAuth.js
- **Responsive Design**: Mobile-first design with desktop optimization
- **Regional Payment Integration**: Stripe, Razorpay, eSewa, Khalti, Bank Transfer
- **Real-time Database**: PostgreSQL with Prisma ORM

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | NextAuth.js v4 |
| Payments | Stripe, Razorpay, eSewa, Khalti |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── payments/     # Payment processing
│   ├── checkout/         # Checkout flow
│   ├── creator/          # Creator profile pages
│   ├── dashboard/        # User dashboards
│   ├── explore/          # Creator discovery
│   ├── login/            # Authentication pages
│   └── signup/
├── components/
│   ├── layout/           # Layout components (Header)
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── payments/         # Payment gateway integrations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Database seeding script
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Payment provider credentials (optional for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/creatorconnect.git
cd creatorconnect
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Push database schema:
```bash
npx prisma db push
```

6. Seed the database (optional):
```bash
npx tsx prisma/seed.ts
```

7. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct database connection (for migrations) | Yes |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | No |
| `RAZORPAY_KEY_ID` | Razorpay key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | No |
| `ESEWA_MERCHANT_ID` | eSewa merchant ID | No |
| `KHALTI_SECRET_KEY` | Khalti secret key | No |

## Database Schema

The application uses 10 interconnected models:

- **User**: Core user model with role-based access (FAN/CREATOR)
- **Account/Session**: NextAuth.js authentication models
- **CreatorProfile**: Extended profile for creators
- **SubscriptionTier**: Pricing tiers created by creators
- **Subscription**: Fan subscriptions to creator tiers
- **Post**: Content published by creators
- **Comment**: User comments on posts
- **Payment**: Transaction records for all payments

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js authentication |
| `/api/auth/signup` | POST | User registration |
| `/api/payments/[provider]` | POST | Create payment order |
| `/api/payments/[provider]` | GET | Get available payment providers |

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

For other platforms, ensure:
- Node.js 18+ runtime
- PostgreSQL database access
- Environment variables configured

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
