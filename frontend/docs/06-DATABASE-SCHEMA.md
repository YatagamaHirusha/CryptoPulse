# Database Schema (Supabase)

The application uses Supabase (PostgreSQL) as its primary data store. Below is an overview of the core tables and their purpose.

## Tables

### `articles`
Stores the main news content.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `title` | Text | Article headline |
| `content` | Text | Full article body (HTML/Markdown) |
| `excerpt` | Text | Short summary for cards |
| `category` | Text | e.g., "Bitcoin", "DeFi", "Regulation" |
| `cover_image` | Text | URL to the image in Supabase Storage |
| `author_id` | UUID | Foreign Key to `authors` table |
| `created_at` | Timestamp | Publication date |
| `view_count` | Integer | Number of reads |
| `ai_summary` | Text | "AI Quick Read" summary |
| `slug` | Text | URL-friendly identifier |
| `is_featured` | Boolean | Whether to show in the Hero section |

### `authors`
Stores information about content creators/sources.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | Text | Author's display name |
| `avatar` | Text | URL to profile picture |
| `bio` | Text | Short biography |
| `role` | Text | e.g., "Editor", "Contributor" |

### `subscribers`
Stores email addresses for the newsletter.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `email` | Text | User's email address |
| `created_at` | Timestamp | Signup date |

## Relationships

-   **Articles -> Authors**: Many-to-One. Each article belongs to one author.
-   **Articles -> Categories**: (Implicit) Articles are filtered by the `category` text column.

## Storage Buckets

-   `article-images`: Stores the generated cover images for articles.
