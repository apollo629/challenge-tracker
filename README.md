# Challenge Tracker

A full-stack web application for tracking challenges, teams, and progress with leaderboards.

**Live Demo:** [https://challenge-tracker-jet.vercel.app](https://challenge-tracker-jet.vercel.app)

## Features

- **Challenges Management**: Create, edit, and track challenges with date ranges
- **User Management**: Add and manage participants
- **Team Management**: Organize users into teams with flexible membership (users can be in multiple teams)
- **Progress Logging**: Log daily progress for any challenge within its date range
- **Leaderboards**:
  - Individual leaderboard (ranked by total progress)
  - Team leaderboard (ranked by average member progress)
  - Internal team leaderboard (see how members rank within a team)
- **Dashboard**: Overview of active challenges and quick stats

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| UI | Tailwind CSS + shadcn/ui |
| Language | TypeScript |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) for free)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/apollo629/challenge-tracker.git
   cd challenge-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database connection string:
   ```
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. (Optional) Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Push schema changes to database |

## Project Structure

```
challenge-tracker/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── challenges/  # Challenge pages
│   │   ├── teams/       # Team pages
│   │   ├── users/       # User pages
│   │   ├── layout.tsx   # Root layout with navigation
│   │   └── page.tsx     # Dashboard
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   └── lib/
│       ├── prisma.ts    # Prisma client
│       └── utils.ts     # Utility functions
└── package.json
```

## Database Schema

- **Challenge**: Title, description, start/end dates
- **User**: Name
- **Team**: Name
- **TeamMember**: Links users to teams (many-to-many)
- **ProgressLog**: Daily progress entries (user + challenge + date = unique)

## Deployment

The app is configured for easy deployment to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

The build process automatically:
- Generates Prisma client
- Pushes schema to database
- Seeds database if empty

## License

MIT
