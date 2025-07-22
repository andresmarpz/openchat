# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level (Turborepo)
- `bun dev` - Start all applications in parallel via Turbo
- `bun install` - Install dependencies for all workspaces

### API Server (`apps/api/`)
- `bun run dev` - Start API server with hot reloading on port 4000
- `bun run db:generate` - Generate Drizzle migrations from schema
- `bun run db:migrate` - Apply database migrations
- `bun run db:studio` - Open Drizzle Studio for database management

### Frontend (`apps/chat/`)
- `bun run dev` - Start Next.js development server with Turbopack
- `bun run build` - Build production application
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Architecture Overview

OpenChat is a monorepo containing a TypeScript API server and Next.js frontend for LLM chat interactions.

### Project Structure
- **`apps/api/`** - Hono.js API server with tRPC and AI streaming
- **`apps/chat/`** - Next.js 15 frontend with Tailwind CSS
- **`apps/docs/`** - Documentation (minimal)

### Technology Stack

#### Backend (`apps/api/`)
- **Runtime**: Bun (not Node.js)
- **Framework**: Hono.js with tRPC server integration
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Vercel AI SDK with OpenRouter provider
- **Authentication**: Supabase Auth integration

#### Frontend (`apps/chat/`)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State**: React hooks with tRPC React Query integration
- **Auth**: Supabase client-side authentication

### Key Architecture Details

#### Database Schema
- Uses Drizzle ORM with PostgreSQL
- Main entity: `threads` table with user relationships via Supabase auth
- Schema located in `apps/api/src/db/schema/`

#### tRPC API Routes
- **`threads.create`** - Create new chat thread
- **`threads.get_all`** - Get user's threads
- **`threads.chat`** - Send message and stream AI response

#### AI Integration
- Uses Vercel AI SDK's `streamText` with OpenRouter
- Streams responses via tRPC mutations
- Default model: `openai/gpt-4o-mini`

#### Frontend Communication
- Uses tRPC client for API communication
- AI responses streamed via tRPC subscriptions
- Authentication handled via Supabase client

## Important Notes

- **Always use Bun** instead of Node.js, npm, or other package managers
- **Database migrations** must be generated with `bun run db:generate` before applying
- **Environment variables** are auto-loaded by Bun (no dotenv needed in API)
- **Supabase integration** requires proper environment variables for both apps
- **AI responses** are streamed, not returned as single responses