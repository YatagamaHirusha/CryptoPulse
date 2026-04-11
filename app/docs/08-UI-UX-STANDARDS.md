# UI/UX Design Standards & Prompts

This document defines the design system, typography, and styling prompts used to maintain a consistent look and feel across Web3Instant.

## Typography

We use a combination of Google Fonts optimized via `next/font/google`.

| Font Family | Variable | Usage |
| :--- | :--- | :--- |
| **Inter** | `--font-inter` | Primary body text, UI elements, and general readability. |
| **Outfit** | `--font-outfit` | Headings, titles, and brand elements. Modern and geometric. |
| **IBM Plex Sans** | `--font-ibm-plex` | Data-heavy sections, tickers, or technical details. |

### Implementation in `layout.tsx`
```tsx
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });
const ibmPlexSans = IBM_Plex_Sans({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"], 
  variable: '--font-ibm-plex' 
});
```

## Color Palette

The design relies on a clean, high-contrast palette with a signature brand color.

| Color Name | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Red** | `#D00000` | `bg-brand-red`, `text-brand-red` | Primary actions, highlights, logos, active states. |
| **Slate 900** | `#0f172a` | `text-slate-900` | Primary text (Light Mode). |
| **White** | `#ffffff` | `bg-white`, `text-white` | Backgrounds, text (Dark Mode). |
| **Zinc 900** | `#18181b` | `dark:bg-zinc-900` | Backgrounds (Dark Mode). |

## Styling Prompts for AI Generation

When asking an AI (like ChatGPT or Claude) to generate new UI components, use the following system prompt to ensure consistency:

```text
You are an expert UI/UX designer and frontend developer for "Web3Instant".
Create a React component using Next.js 14+, TypeScript, and Tailwind CSS.

Design Guidelines:
1.  **Typography**:
    -   Use `font-sans` (Inter) for body text.
    -   Use `font-heading` (Outfit) for h1-h6 titles.
    -   Use `font-mono` or IBM Plex Sans for data/numbers.
2.  **Colors**:
    -   Primary accent: `#D00000` (use `text-brand-red` or `bg-brand-red`).
    -   Backgrounds: Clean white (`bg-white`) for light mode, deep zinc (`dark:bg-zinc-900`) for dark mode.
    -   Borders: Subtle slate (`border-slate-200`) or zinc (`dark:border-zinc-800`).
3.  **Styling**:
    -   Use `rounded-xl` or `rounded-2xl` for cards and containers.
    -   Use subtle shadows (`shadow-sm`, `shadow-md`).
    -   Ensure full Dark Mode support (`dark:` classes).
    -   Use Lucide React for icons.
4.  **Interactivity**:
    -   Add hover effects (`hover:bg-slate-50`, `transition-colors`).
    -   Use `active:scale-95` for buttons.

Output the code as a functional component.
```

## Common UI Patterns

### Cards
-   **Border**: `border border-slate-200 dark:border-zinc-800`
-   **Radius**: `rounded-xl`
-   **Padding**: `p-4` or `p-6`
-   **Background**: `bg-white dark:bg-zinc-900`

### Buttons (Primary)
-   **Classes**: `bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium`

### Tags / Badges
-   **Classes**: `px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 rounded`
