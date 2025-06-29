# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Python/FastAPI)
- **Start development server**: `poe dev` (runs on port 4000)
- **Run tests**: `pytest`
- **Lint and format**: `ruff check` and `ruff format`
- **Install dependencies**: `uv sync`

### Frontend (Next.js)
- **Start development server**: `npm run dev` (from `apps/chat/`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Architecture Overview

This is a monorepo containing a chat application with LLM integration:

### Backend (`apps/backend/`)
- **Framework**: FastAPI with async support
- **LLM Integration**: Uses LangGraph + LangChain for conversation flow
- **API**: Single chat endpoint `/api/v1/chat` that streams responses
- **Settings**: Environment-based configuration via Pydantic Settings
- **LLM Provider**: OpenRouter API (configurable via environment variables)

Key files:
- `src/api/app.py`: FastAPI application with CORS and streaming chat endpoint
- `src/lg/graph.py`: LangGraph conversation flow using OpenAI/GPT-4o-mini
- `src/core/settings.py`: Configuration management

### Frontend (`apps/chat/`)
- **Framework**: Next.js 15 with React 19
- **UI**: Tailwind CSS + Radix UI components
- **State**: React Hook Form with Zod validation
- **LangGraph Integration**: Uses `@langchain/langgraph-sdk` for backend communication

### Environment Setup
Backend requires:
```
OPENROUTER_API_KEY=your_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Deployment
- Docker Compose configuration available
- Backend serves on port 4000, frontend on port 3000