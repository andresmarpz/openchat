# 🚀 OpenChat

<div align="center">

**Democratizing AI Conversations for Everyone**

*An open-source chatbot application that brings the power of multiple LLMs to all humans, built with modern web technologies and AI frameworks.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=for-the-badge&logo=langchain)](https://langchain.dev/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)

</div>

## ✨ Vision & Purpose

OpenChat bridges the gap between cutting-edge AI technology and everyday users. Our mission is simple yet powerful: **provide access to the world's most advanced language models to all humans**, regardless of their technical background.

This isn't just another chatbot—it's a gateway to AI democratization, designed to:
- 🌍 Make AI accessible to non-technical audiences
- 🎓 Serve as a comprehensive learning resource for developers
- 🔧 Demonstrate best practices in modern AI application development
- 🚀 Provide a robust alternative to proprietary AI chat platforms

## 🏗️ Architecture

OpenChat is built with a modern, scalable architecture that showcases industry best practices:

### Frontend (Next.js 15)
- **Framework**: Next.js with App Router and Turbopack
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state
- **Authentication**: Supabase Auth integration
- **Type Safety**: Full TypeScript implementation

### Backend (Python + FastAPI)
- **API Framework**: FastAPI with async/await support
- **AI Orchestration**: LangChain + LangGraph for conversation flows
- **LLM Integration**: OpenRouter for multi-model access
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Supabase integration
- **Deployment**: Docker containerization

### Key Features

🤖 **Multi-LLM Support**
- Access to dozens of models through OpenRouter
- Seamless switching between different AI providers
- Cost-effective model selection

💬 **Intelligent Conversations**
- Streaming responses for real-time interaction
- Context-aware conversation management
- Message persistence and history

🔐 **Secure & Scalable**
- User authentication and authorization
- Database-backed conversation storage
- CORS-enabled API with proper security headers

🎨 **Beautiful UI/UX**
- Modern, responsive design
- Dark/light mode support
- Smooth animations and transitions
- Mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Bun
- Python 3.13+
- PostgreSQL
- OpenRouter API key

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/andresmarpz/openchat.git
cd openchat
```

2. **Backend Setup**
```bash
cd apps/backend
cp .env.example .env  # Configure your environment variables
uv sync
uv run poe dev
```

3. **Frontend Setup**
```bash
cd apps/chat
bun install
bun dev
```

4. **Database Setup**
```bash
# Start PostgreSQL with Docker
cd apps/backend
docker-compose up postgres -d

# Run migrations
uv run alembic upgrade head
```

### Environment Variables

Create `.env` files in both `apps/backend/` and `apps/chat/`:

**Backend (.env)**
```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DATABASE_URL=postgresql://openchat:password@localhost:5432/openchat
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | Modern web application |
| **Styling** | Tailwind CSS, Radix UI | Beautiful, accessible UI |
| **Backend** | FastAPI, Python 3.13 | High-performance API |
| **AI/ML** | LangChain, LangGraph | AI orchestration |
| **Database** | PostgreSQL, SQLAlchemy | Data persistence |
| **Auth** | Supabase | User management |
| **LLMs** | OpenRouter | Multi-model access |
| **Deployment** | Docker, Docker Compose | Containerization |

## 📚 Learning Resource

OpenChat serves as an excellent educational resource for developers interested in:

- **Modern Web Development**: Next.js 15 with App Router, React Server Components
- **AI Application Development**: LangChain/LangGraph integration patterns
- **Full-Stack Architecture**: FastAPI + Next.js communication
- **Database Design**: PostgreSQL with proper migrations
- **Authentication**: Supabase integration patterns
- **DevOps**: Docker containerization and deployment

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, or improving documentation, your help makes OpenChat better for everyone.

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Submit pull requests with clear descriptions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 About the Creator

OpenChat is crafted with passion by **Andres Martinez** ([@andresmarpz](https://github.com/andresmarpz)), a software engineer dedicated to making AI technology accessible to everyone.

Andres specializes in building scalable web applications and AI-powered solutions, with a focus on developer experience and user-centric design. When not coding, you can find him exploring the latest in AI research, contributing to open-source projects, or sharing knowledge with the developer community.

**Connect with Andres:**
- 🐙 GitHub: [@andresmarpz](https://github.com/andresmarpz)
- 🐦 X (Twitter): [@andresmarpz](https://x.com/andresmarpz)
- 💼 LinkedIn: [@andresmarpz](https://linkedin.com/in/andresmarpz)

---

<div align="center">

### Built with ❤️ for the AI community

<svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(10, 15)">
    <!-- A -->
    <path d="M5 35 L15 10 L25 35 M10 25 L20 25" 
          stroke="url(#signatureGradient)" 
          stroke-width="3" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
    <!-- M -->
    <path d="M35 35 L35 10 L45 25 L55 10 L55 35" 
          stroke="url(#signatureGradient)" 
          stroke-width="3" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
    <!-- z -->
    <path d="M65 20 L85 20 L65 30 L85 30" 
          stroke="url(#signatureGradient)" 
          stroke-width="3" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
    <!-- Decorative underline -->
    <path d="M5 40 Q50 45 85 40" 
          stroke="url(#signatureGradient)" 
          stroke-width="2" 
          fill="none" 
          stroke-linecap="round" 
          opacity="0.6"/>
  </g>
</svg>

*Empowering conversations, one chat at a time.*

</div>
