# Project Overview

**Web3Instant** is a modern, automated Web3 news platform built with Next.js, Supabase, and AI-powered content generation.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Localization**: Custom `[lang]` routing (EN, ES, FR, AR)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (if applicable)
- **Storage**: Supabase Storage (for article images)

### AI & Automation
- **LLM Processing**: Groq (`llama-3.3-70b-versatile`) & OpenAI (Fallback)
- **Image Generation**: Google Gemini (`gemini-3-pro-image-preview`)
- **News Aggregation**: RSS Parser + Node.js Scripts

## Folder Structure

```
/app
  /app              # Next.js App Router pages & components
    /api            # API Routes (e.g., /api/chat)
    /[lang]         # Localized pages
    /components     # Reusable UI components
    /lib            # Utility functions (Supabase, Date, etc.)
  /scripts          # Backend automation scripts
    /news-bot       # Core news aggregation bot
  /public           # Static assets
```

## Key Features

1.  **Automated News Bot**: Fetches RSS feeds, rewrites content using AI, generates custom images, and publishes to the database.
2.  **Satoshi AI Chat Bot**: An interactive AI assistant on every article page that answers questions based on the article's context.
3.  **Multi-Language Support**: Full localization for English, Spanish, French, and Arabic.
4.  **Dynamic Navigation**: Automatically hides categories that have no content.
5.  **AI Quick Read**: Auto-generated summaries for quick consumption.
