# Image Generation Pipeline

The platform uses a sophisticated pipeline to generate unique, stylized images for every news article.

## 1. Prompt Engineering (`llm.ts`)

Before generating an image, we first generate a **prompt**. We don't just send the article title to the image generator; we use an LLM to create a detailed visual description.

-   **Input**: Article Title + Content Snippet.
-   **LLM**: Groq (`llama-3.3-70b-versatile`).
-   **Instructions**:
    -   Style: "Nano Banana" (Colorful, illustrative, modern tech, 3D render).
    -   Constraint: No text in the image.
    -   Focus: Core theme of the news.
    -   Length: Under 50 words.

## 2. Image Generation (`image.ts`)

-   **Provider**: Google Gemini (`gemini-3-pro-image-preview`).
-   **Process**:
    1.  Receives the prompt from step 1.
    2.  Appends style enforcers if missing (e.g., "vibrant colors").
    3.  Calls the Gemini API.
    4.  Returns the image as a binary buffer.

## 3. Storage & Optimization

-   **Upload**: The image buffer is uploaded to a Supabase Storage bucket (`article-images` or similar).
-   **Public URL**: The script retrieves the public URL of the uploaded file.
-   **Database**: This URL is saved in the `cover_image` column of the `articles` table.

## Why this approach?

-   **Consistency**: By using a specific style prompt ("Nano Banana"), all images on the site have a cohesive look and feel.
-   **Relevance**: Generating the prompt from the article content ensures the image actually matches the news story.
-   **Automation**: Zero human intervention required.
