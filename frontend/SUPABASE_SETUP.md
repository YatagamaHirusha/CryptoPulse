# Supabase CMS Setup Guide

## 🎯 Overview
This guide will help you set up Supabase as your content management system for managing articles.

## 📋 Prerequisites
- Supabase account (free tier works great)
- Your Supabase URL and Anon Key already configured in `.env.local`

## 🚀 Setup Steps

### 1. Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `supabase-schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ `articles` table with all necessary columns
- ✅ `categories` table with default categories
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket for article images
- ✅ Proper permissions for authenticated users

### 2. Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@yoursite.com` (or your email)
   - Password: Choose a strong password
   - Auto Confirm User: **Yes** ✅
4. Click **Create user**

### 3. Test the Admin Panel

1. Navigate to `/admin` on your site
2. Login with the credentials you just created
3. You should see the admin dashboard!

## 📝 Using the Admin Panel

### Creating an Article

1. Click **"New Article"** button
2. Fill in the form:
   - **Title**: Your article headline
   - **Category**: Select from dropdown
   - **Cover Image**: Click "Upload Image" and select a file
   - **Excerpt**: Brief summary (2-3 sentences)
   - **Content**: Use the rich text editor
   - **Publish**: Check to make it live
   - **Featured**: Check to highlight it
3. Click **"Create Article"**

### Features

✨ **Rich Text Editor**
- Headings, bold, italic, underline
- Lists (ordered & unordered)
- Blockquotes and code blocks
- Insert links and images
- Clean formatting

✨ **Image Upload**
- Drag & drop support
- Automatic upload to Supabase Storage
- Public CDN URLs
- Image preview

✨ **Draft System**
- Save articles as drafts (unpublished)
- Publish when ready
- Edit published articles

✨ **Article Management**
- View all your articles
- Edit existing articles
- Delete articles
- See view counts
- Publication status badges

## 🔒 Security

The setup includes:
- **Row Level Security (RLS)**: Users can only edit/delete their own articles
- **Authentication Required**: Must be logged in to create/edit
- **Public Read**: Published articles are viewable by everyone
- **Storage Policies**: Authenticated users can upload images

## 🎨 Customization

### Adding Categories

Edit the SQL or add through Supabase dashboard:
```sql
INSERT INTO categories (name, slug) VALUES
  ('Your Category', 'your-category');
```

### Changing Upload Limits

Go to **Storage** → **article-images** → **Settings** to adjust:
- Max file size
- Allowed MIME types
- Public access settings

## 📊 Connecting to Your Frontend

The articles are now in Supabase! Update your homepage to fetch real data:

```typescript
import { supabase } from './lib/supabase';

// Fetch published articles
const { data: articles } = await supabase
  .from('articles')
  .select('*')
  .eq('published', true)
  .order('created_at', { descending: true });
```

## 🐛 Troubleshooting

**Can't login?**
- Check your email/password
- Verify user is confirmed in Supabase Auth
- Check browser console for errors

**Image upload fails?**
- Verify storage bucket exists
- Check storage policies are created
- Ensure file is under size limit

**Articles don't appear?**
- Check `published` is set to `true`
- Verify RLS policies allow read access
- Check browser console for errors

## 📚 Next Steps

1. **Update Homepage**: Replace mock data with Supabase queries
2. **Add SEO**: Use article metadata for better SEO
3. **Analytics**: Track article views in Supabase
4. **Search**: Add full-text search with Supabase
5. **Comments**: Add user comments with authentication

## 🎉 You're Ready!

Your CMS is now set up. Start creating amazing content! 🚀
