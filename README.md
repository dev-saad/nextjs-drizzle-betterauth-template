# FlowKet - Modern Next.js SaaS Template

A production-ready starter template for building modern SaaS applications with Next.js 16, Drizzle ORM, Better Auth, and Tailwind CSS v4.

## 🚀 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Data Tables:** [TanStack Table](https://tanstack.com/table/v8)
- **Emails:** [React Email](https://react.email/) & [Resend](https://resend.com/)
- **Storage:** Cloudflare R2 (via [@better-upload/client](https://better-upload.com/))
- **Captcha:** Cloudflare Turnstile

## ✨ Features

- **Authentication & Authorization**:
  - Secure Sign In / Sign Up
  - Google OAuth Integration
  - Two-Factor Authentication (2FA)
  - Role-Based Access Control (RBAC) with Permissions
- **Organization Management**:
  - Create and switch between organizations
  - Member management and invitations
  - Role management (Create/Edit Custom Roles)
  - Granular permission settings
- **User Dashboard**:
  - Responsive layout with Sidebar
  - User Settings & Profile Management
  - Theme Switching (Light/Dark/System/Custom Colors)
- **Developer Experience**:
  - Type-safe database queries with Drizzle
  - Easy database migrations
  - Email template previewing
  - Pre-configured ESLint and Prettier

## 🛠️ Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v20+ recommended)
- Use a package manager like `npm`, `pnpm`, or `yarn`.

### 1. Clone the repository

```bash
git clone https://github.com/alsaadkarim/nextjs-drizzle-betterauth-template.git
cd nextjs-drizzle-betterauth-template
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables. You can reference the list below:

```env
# Database (Neon / Postgres)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your_super_secret_string
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Emails (Resend)
RESEND_API_KEY=re_123456789

# Storage (Cloudflare R2)
CLOUDFLARE_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_r2_secret_key
NEXT_PUBLIC_CLOUDFLARE_BASE_URL=https://<your-bucket-name>.r2.cloudflarestorage.com

# Security (Cloudflare Turnstile)
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
# Also requires NEXT_PUBLIC_TURNSTILE_SITE_KEY in your frontend code if used on client side

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Generate a secure `BETTER_AUTH_SECRET` using `openssl rand -base64 32` or a similar tool.

### 4. Database & Drizzle Setup

This project uses **Drizzle ORM** for database management.

#### 1. Define Schemas

Your database schemas are located in `src/lib/drizzle/schemas`. To add a new table:

1. Create a new file (e.g., `products.schema.ts`) in that directory.
2. Define your table using Drizzle's syntax.
3. Export it in `src/lib/drizzle/schemas/index.ts` (or ensuring your main schema file exports it).

#### 2. Push Changes

After modifying schemas, sync your changes with the Neon/Postgres database:

```bash
npm run db:push
```

This command will:

- Read your schema files.
- Compare them with the current database state.
- Apply necessary changes (create tables, add columns, etc.).

> **Tip:** You can view and manage your data visually by running `npx drizzle-kit studio`.

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

* `npm run db:push`: Pushes schema changes to the database using Drizzle Kit.
* `npm run dev:email`: Starts the email preview server locally.

## 📂 Project Structure

```
├── src
│   ├── app              # Next.js App Router pages and API routes
│   ├── components       # Reusable UI components
│   ├── features         # Feature-specific components and logic (auth, onboarding, etc.)
│   ├── lib              # Utilities, database config, auth config, schema definitions
│   │   ├── auth         # Better Auth configuration
│   │   ├── drizzle      # Drizzle ORM schema and db connection
│   │   └── store        # Zustand stores
│   ├── hooks            # Custom React hooks
│   └── actions          # Server Actions
├── drizzle              # Drizzle migrations folder
├── public               # Static assets
└── ...config files
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Open issues for bugs or feature requests.
- Submit pull requests to improve the project.

## 📄 License

This project is licensed under the MIT License.
