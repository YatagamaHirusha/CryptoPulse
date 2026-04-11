# System Architecture

This document provides a high-level view of how the different components of Web3Instant interact with each other.

## High-Level Diagram

```mermaid
graph TD
    User[User / Browser]
    
    subgraph "Frontend (Next.js)"
        Pages[Pages / Components]
        API[API Routes (/api/chat)]
        Utils[Utilities (Date, Supabase)]
    end
    
    subgraph "Backend Services"
        SupabaseDB[(Supabase Database)]
        SupabaseAuth[Supabase Auth]
        SupabaseStorage[Supabase Storage]
    end
    
    subgraph "Automation (News Bot)"
        Bot[Node.js Script]
        RSS[RSS Parser]
        LLM[LLM Processor (Groq/OpenAI)]
        ImgGen[Image Generator (Gemini)]
    end
    
    subgraph "External APIs"
        GroqAPI[Groq API]
        GeminiAPI[Google Gemini API]
        RSSFeeds[External RSS Feeds]
    end

    %% Flows
    User -->|Visits| Pages
    User -->|Chats| API
    
    Pages -->|Reads Data| SupabaseDB
    Pages -->|Loads Images| SupabaseStorage
    
    API -->|Sends Context| GroqAPI
    API -->|Returns Answer| User
    
    Bot -->|Fetches| RSSFeeds
    Bot -->|Sends Text| LLM
    LLM -->|Returns Rewrite/Prompt| Bot
    Bot -->|Sends Prompt| ImgGen
    ImgGen -->|Returns Image| Bot
    
    Bot -->|Saves Article| SupabaseDB
    Bot -->|Uploads Image| SupabaseStorage
```

## Component Interaction

### 1. Content Ingestion Flow (The "News Bot")
This is an asynchronous background process that runs independently of the user interface.
1.  **Trigger**: Cron job or manual execution.
2.  **Ingest**: Fetches raw data from external RSS feeds.
3.  **Process**:
    -   Uses **Groq** to rewrite text and generate summaries.
    -   Uses **Gemini** to generate custom images.
4.  **Store**: Saves the final structured data into **Supabase**.

### 2. User Experience Flow (The Website)
This is the real-time interaction layer.
1.  **Render**: Next.js Server Components fetch article data directly from **Supabase**.
2.  **Localize**: The URL path (`/[lang]`) determines which language resources to load.
3.  **Interact**:
    -   **Satoshi AI**: The client sends the article context to the Next.js API route (`/api/chat`).
    -   **API Route**: Acts as a secure proxy, adding the API key and system prompt before calling **Groq**.

## Security & Performance

-   **API Keys**: All sensitive keys (Groq, Gemini, Supabase Service Role) are stored in environment variables on the server side. They are never exposed to the client.
-   **Edge Caching**: Next.js caches static pages and assets to ensure fast load times.
-   **Database Policies**: Supabase Row Level Security (RLS) ensures that the public can only *read* articles, while only the admin/bot can *write* them.
