# Satoshi AI Chat Bot

**Satoshi AI** is an interactive Q&A feature embedded on every article page. It allows users to ask questions specifically about the article they are reading.

## How It Works

### Frontend (`ArticleClient.tsx`)
-   **UI**: A chat interface located below the article content.
-   **State**: Manages the chat history (`chatMessages`), input state, and loading status.
-   **Context Truncation**: Before sending the article content to the API, it is truncated to ~6000 characters to avoid hitting LLM token limits.
-   **UX Enhancements**:
    -   "Thinking..." state with a minimum 2-second delay for realism.
    -   Auto-scrolling to the latest message.
    -   Localized UI labels (EN, ES, FR, AR).

### Backend (`/api/chat/route.ts`)
-   **Route Handler**: A Next.js API route that accepts `POST` requests.
-   **Input Validation**: Checks for `message` and `context`.
-   **System Prompt**:
    -   Enforces that the AI answers **ONLY** based on the provided context.
    -   Includes a strict **Financial Disclaimer** (refuses investment advice, says "DYOR").
    -   Sets the persona to "Satoshi AI".
-   **LLM Integration**: Uses **Groq API** with the `llama-3.3-70b-versatile` model for fast and accurate responses.
-   **Error Handling**: Returns structured error messages if the API call fails or keys are missing.

## Context Injection

The context sent to the LLM includes structured metadata:

```text
Title: [Article Title]
Author: [Author Name]
Date: [Publication Date]
Category: [Category]

Content: [Truncated Article Content]
```

This ensures the bot knows exactly what the user is referring to.

## Configuration

Requires the following environment variable:
-   `GROQ_API_KEY`: Your Groq API key.
