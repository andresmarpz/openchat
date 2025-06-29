# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

This is a Next.js 15 chat application frontend that communicates with a Python backend via server-sent events (SSE). The application is part of a larger OpenChat monorepo structure.

### Key Components

- **App Router Structure**: Uses Next.js App Router with TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks with local state
- **Backend Communication**: Uses `@langchain/langgraph-sdk` for message types and SSE streaming

### Core Architecture

- `src/app/page.tsx` - Main entry point rendering InputBox component
- `src/components/primitives/InputBox.tsx` - Main chat interface with form handling
- `src/hooks/use-thread.ts` - Manages chat messages and backend communication via SSE
- `src/components/chat/chat.tsx` - Basic message display component (currently unused)

### Backend Integration

The frontend expects a backend at `NEXT_PUBLIC_BACKEND_URL` with:
- `POST /chat` endpoint accepting messages in LangGraph SDK format
- Server-sent events response streaming with format: `event: <event>\ndata: <json>\n\n`
- Message chunks contain `{content, type: "AIMessageChunk", name, id}`

### Path Aliases

The project uses `~/*` alias for `./src/*` paths configured in tsconfig.json.

### shadcn/ui Configuration

Components use "new-york" style with stone base color and CSS variables. Icons from Lucide React.