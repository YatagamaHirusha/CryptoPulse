# Web3Instant News Platform

This is a Next.js application built for high-performance news delivery.

## Features
- **Crypto Ticker**: Real-time price updates from CoinGecko.
- **Responsive Design**: Mobile-first UI with Tailwind CSS.
- **Admin Portal**: Secure login for authors to manage content.
- **Supabase Integration**: Ready for backend connection.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Supabase**:
    - Create a project at [supabase.com](https://supabase.com).
    - Create a table named `articles` with columns: `id`, `title`, `content`, `excerpt`, `cover_image`, `category`, `author_id`, `created_at`.
    - Create a `.env.local` file in this directory with your keys:
      ```
      NEXT_PUBLIC_SUPABASE_URL=your-project-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
      ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000).
