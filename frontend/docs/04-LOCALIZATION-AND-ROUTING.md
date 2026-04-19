# Localization & Routing

Web3Instant supports multiple languages (English, Spanish, French, Arabic) using a sub-path routing strategy.

## Routing Structure

The application uses Next.js dynamic routes to handle locales:

-   `app/[lang]/page.tsx`: Homepage for a specific language (e.g., `/en`, `/es`).
-   `app/[lang]/article/[id]/page.tsx`: Article detail page.
-   `app/[lang]/[category]/page.tsx`: Category listing page.

The `[lang]` parameter is extracted in `layout.tsx` and page components to determine which content to fetch or display.

## Date Formatting (`dateUtils.ts`)

We use a custom utility `formatTimeAgo` to display relative time (e.g., "2 hours ago") in the correct language.

-   **Library**: `date-fns`
-   **Locales**: Imports `enUS`, `es`, `fr`, `ar` from `date-fns/locale`.
-   **Logic**:
    1.  Takes a date string and the current language code.
    2.  Maps the language code to the corresponding `date-fns` locale object.
    3.  Uses `formatDistanceToNow` to generate the string.

## Dynamic Navigation

The navigation menu (Navbar/Footer) is dynamic and content-aware.

-   **Logic**: In `layout.tsx`, the app fetches the count of articles for each category.
-   **Filtering**: Categories with `0` articles are automatically filtered out of the `activeCategories` list.
-   **Result**: Users never click on a category link that leads to an empty page.

## Translation Management

-   **Static UI Text**: Managed via simple translation objects (dictionaries) within components (e.g., `TRANSLATIONS` object in `ArticleClient.tsx`).
-   **Dynamic Content**: Article content is translated during the ingestion phase (by the News Bot) and stored in language-specific columns (future implementation) or fetched dynamically.
