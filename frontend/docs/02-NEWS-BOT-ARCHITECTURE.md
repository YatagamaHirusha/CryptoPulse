# News Bot Architecture

The **News Bot** is a standalone Node.js automation script located in `scripts/news-bot/`. Its primary function is to aggregate news from RSS feeds, process the content using AI, and publish it to the Supabase database.

## Workflow

1.  **Fetch RSS Feeds** (`rss.ts`)
    -   The bot reads a list of RSS feed URLs.
    -   It parses the feeds to extract the latest articles (title, link, content/snippet).
    -   It checks the database to ensure the article hasn't already been processed (deduplication).

2.  **Content Processing** (`llm.ts`)
    -   **Rewriting**: The raw content is sent to an LLM (Groq `llama-3.3-70b-versatile` or OpenAI fallback) to be rewritten.
    -   **Summarization**: A short "AI Quick Read" summary is generated.
    -   **Translation**: If enabled, content is translated into supported languages.
    -   **Prompt Generation**: The LLM analyzes the article to create a descriptive image generation prompt (e.g., "Nano Banana style...").

3.  **Image Generation** (`image.ts`)
    -   The generated prompt is sent to **Google Gemini** (`gemini-3-pro-image-preview`).
    -   The API returns a generated image buffer.
    -   The image is uploaded to Supabase Storage, and the public URL is retrieved.

4.  **Publishing** (`index.ts`)
    -   The processed article (rewritten content, summary, image URL, metadata) is inserted into the `articles` table in Supabase.
    -   HTML formatting is applied to ensure the content looks good on the frontend.

## Key Files

-   `index.ts`: The main orchestrator. Initializes Supabase, runs the loop, and handles database insertion.
-   `rss.ts`: Handles fetching and parsing of RSS feeds.
-   `llm.ts`: Wrapper for Groq/OpenAI API calls for text processing.
-   `image.ts`: Wrapper for Google Gemini API for image generation.

## Running the Bot

The bot is typically run via a cron job or manually:

```bash
npm run bot
# or
npx tsx scripts/news-bot/index.ts
```
