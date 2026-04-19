'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { compressImage } from '../../../lib/imageUtils';
import { 
  Lock, Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Save, 
  Image as ImageIcon, User, Settings, Briefcase, Search, 
  ChevronLeft, ChevronRight, LayoutDashboard, FileText, 
  Users, BarChart3, LogOut, Menu, Bell,
  Globe, TrendingUp, Clock, Star, Shield
} from 'lucide-react';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import 'react-quill-new/dist/quill.snow.css';
import type ReactQuillType from 'react-quill-new';
import JobApplicationsAdmin from '../../../components/JobApplicationsAdmin';
import PartnershipInquiriesAdmin from '../../../components/PartnershipInquiriesAdmin';
import TeamManagement from '../../../components/TeamManagement';

// ShadCN UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as typeof ReactQuillType;

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_name: string;
  author_avatar: string;
  author_role?: string;
  published: boolean;
  featured: boolean;
  view_count: number;
  created_at: string;
  language: string;
  scheduled_for?: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  email: string;
  role: string;
  system_role: string;
  twitter_url: string;
  linkedin_url: string;
  slug: string;
}

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  featuredArticles: number;
}

const CATEGORIES = ['Business', 'Finance', 'Technology', 'Politics', 'Health', 'Environment', 'Culture', 'Sports', 'Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Gaming', 'Regulation', 'Blockchain'];

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, publishedArticles: 0, totalViews: 0, featuredArticles: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileTwitter, setProfileTwitter] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Business');
  const [coverImage, setCoverImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [articleLanguage, setArticleLanguage] = useState('en');
  const [scheduledFor, setScheduledFor] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [authors, setAuthors] = useState<Profile[]>([]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (session) {
      fetchArticles();
      fetchStats();
    }
  }, [session, currentPage, debouncedSearchQuery, startDate, endDate, authorFilter]);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    if (userRole === 'superadmin' || userRole === 'moderator') {
      fetchAuthors();
    }
  }, [userRole]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchStats = async () => {
    const { data: allArticles } = await supabase.from('articles').select('id, published, featured, view_count');
    if (allArticles) {
      setStats({
        totalArticles: allArticles.length,
        publishedArticles: allArticles.filter(a => a.published).length,
        totalViews: allArticles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        featuredArticles: allArticles.filter(a => a.featured).length,
      });
    }
  };

  const fetchAuthors = async () => {
    if (userRole !== 'superadmin' && userRole !== 'moderator') return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('full_name');
      
    if (data) {
      setAuthors(data as any);
    }
  };

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    // Explicitly select system_role to ensure it's fetched
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, bio, email, avatar_url, role, system_role, twitter_url, linkedin_url, slug')
      .eq('id', session.user.id)
      .single();
      
    if (data) {
      setProfile(data as any);
      setProfileName(data.full_name || '');
      setProfileBio(data.bio || '');
      setProfileEmail(data.email || '');
      setProfileAvatar(data.avatar_url || '');
      setProfileRole(data.role || '');
      const systemRole = data.system_role || 'author';
      console.log('Setting userRole to:', systemRole);
      setUserRole(systemRole); // Set user role for permissions based on system_role
      setProfileTwitter(data.twitter_url || '');
      setProfileLinkedin(data.linkedin_url || '');
    } else {
      const newProfile = {
        id: session.user.id,
        full_name: 'New Author',
        avatar_url: '',
        bio: '',
        email: session.user.email,
        role: 'Author', // Default display role
        system_role: 'author', // Default system role
        twitter_url: '',
        linkedin_url: '',
        slug: slugify('New Author', { lower: true, strict: true }) + '-' + Math.floor(Math.random() * 1000)
      };
      
      const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
      if (!insertError) {
        setProfile(newProfile as Profile);
        setProfileName(newProfile.full_name);
        setProfileEmail(newProfile.email || '');
        setProfileRole(newProfile.role || '');
        setUserRole('author');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    setSavingProfile(true);
    
    try {
      let avatarUrl = profileAvatar;
      
      if (profileImageFile) {
        const compressedFile = await compressImage(profileImageFile);
        const fileName = `avatar-${Math.random()}.webp`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('article-images').upload(filePath, compressedFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(filePath);
        avatarUrl = publicUrl;
        setProfileAvatar(publicUrl);
      }
      
      const slug = slugify(profileName, { lower: true, strict: true });

      const updates = {
        id: session.user.id,
        full_name: profileName,
        bio: profileBio,
        email: profileEmail,
        avatar_url: avatarUrl,
        role: profileRole,
        twitter_url: profileTwitter,
        linkedin_url: profileLinkedin,
        slug: slug,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      await supabase.from('articles').update({ author_name: profileName, author_avatar: avatarUrl }).eq('author_id', session.user.id);
      
    } catch (error: any) {
      alert('Error saving profile: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login result:', data, error);
      if (error) throw error;
      setSession(data.session);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const fetchArticles = async () => {
    let query = supabase.from('articles').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    // Role-based filtering
    if (userRole === 'moderator') {
      // Moderators only see published articles
      query = query.eq('published', true);
    } else if (userRole === 'author') {
      // Authors only see their own articles (RLS handles this, but good to be explicit or if RLS is broader)
      query = query.eq('author_id', session.user.id);
    }
    // Superadmin sees all (no filter needed)

    // Date filtering
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    // Author filtering (only for superadmin/moderator)
    if ((userRole === 'superadmin' || userRole === 'moderator') && authorFilter !== 'all') {
      query = query.eq('author_id', authorFilter);
    }

    if (debouncedSearchQuery) {
      query = query.or(`title.ilike.%${debouncedSearchQuery}%,slug.ilike.%${debouncedSearchQuery}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, count, error } = await query.range(from, to);
    
    if (data) {
      setArticles(data);
      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const fileName = `${Math.random()}.webp`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('article-images').upload(filePath, compressedFile);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
      setCoverImage(data.publicUrl);
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Business');
    setCoverImage('');
    setImageFile(null);
    setPublished(false);
    setFeatured(false);
    setEditingArticle(null);
    setShowForm(false);
    setArticleLanguage('en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = slugify(title, { lower: true, strict: true });
      const user = session?.user;

      const articleData = {
        title,
        slug,
        excerpt,
        content,
        cover_image: coverImage,
        category,
        author_id: user?.id,
        author_name: profileName || user?.user_metadata?.full_name || user?.email || 'Anonymous',
        author_avatar: profileAvatar || user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        author_role: profileRole || 'Author',
        published,
        featured,
        language: articleLanguage,
        scheduled_for: scheduledFor || null,
      };

      if (editingArticle) {
        const { error } = await supabase.from('articles').update(articleData).eq('id', editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert([articleData]);
        if (error) throw error;
      }

      resetForm();
      fetchArticles();
      fetchStats();
    } catch (error: any) {
      alert('Error saving article: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setCategory(article.category);
    setCoverImage(article.cover_image);
    setPublished(article.published);
    setFeatured(article.featured);
    setArticleLanguage(article.language || 'en');
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    if (article.scheduled_for) {
      const date = new Date(article.scheduled_for);
      const formatted = date.toISOString().slice(0, 16);
      setScheduledFor(formatted);
    } else {
      setScheduledFor('');
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      fetchArticles();
      fetchStats();
    } catch (error: any) {
      alert('Error deleting article: ' + error.message);
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      const { error } = await supabase.from('articles').update({ published: !article.published }).eq('id', article.id);
      if (error) throw error;
      fetchArticles();
      fetchStats();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // Sidebar navigation items - based on role
  const navItems = useMemo(() => {
    // Moderators: only Articles and Applications
    if (userRole === 'moderator') {
      return [
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'applications', label: 'Applications', icon: Briefcase },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
    
    // Super Admin: full access (except Settings)
    if (userRole === 'superadmin') {
      return [
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'applications', label: 'Applications', icon: Briefcase },
        { id: 'partnerships', label: 'Partnerships', icon: Users },
        { id: 'team', label: 'Team', icon: Shield },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
    
    // Authors: basic access
    return [
      { id: 'articles', label: 'Articles', icon: FileText },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  }, [userRole]);

  // Login screen
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-14 w-14 bg-red-600/20 rounded-full flex items-center justify-center border border-red-600/30">
              <Lock className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
              <CardDescription className="text-zinc-400">Sign in to manage your content</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-red-500 focus:ring-red-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-red-500 focus:ring-red-500/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sidebar Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-center cursor-default">
          <div className="text-2xl font-logo font-bold tracking-tighter text-white">
            web3<span className="text-red-600">instant</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${activeTab === item.id ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarImage src={profileAvatar} />
            <AvatarFallback className="bg-red-600 text-white">{profileName?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profileName || 'Admin'}</p>
            <p className="text-xs text-zinc-400 truncate">{profileRole || 'Administrator'}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-500 hover:bg-red-600/10" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-black">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-zinc-900 border-r border-zinc-800">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-zinc-900 border-zinc-800">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 text-zinc-400 hover:text-white bg-zinc-900/80 backdrop-blur" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-black">
            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Articles <span className="text-xl text-zinc-500">({stats.totalArticles})</span></h1>
                    <p className="text-zinc-400 mt-1">Manage your content</p>
                  </div>
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" /> New Article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
                        <DialogDescription>Fill in the details below to {editingArticle ? 'update' : 'create'} your article.</DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Enter article title"
                              className="bg-zinc-800 border-zinc-700"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select value={articleLanguage} onValueChange={setArticleLanguage}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="bg-zinc-800 border-zinc-700"
                                disabled={uploading}
                              />
                            </div>
                            {coverImage && (
                              <div className="mt-2 relative aspect-video rounded-lg overflow-hidden max-w-xs">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Excerpt</Label>
                          <Textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief summary of the article..."
                            className="bg-zinc-800 border-zinc-700"
                            rows={3}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Content</Label>
                          <div className="bg-zinc-800 rounded-lg">
                            <ReactQuill
                              theme="snow"
                              value={content}
                              onChange={setContent}
                              className="h-64 mb-12"
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['blockquote', 'code-block'],
                                  ['link', 'image'],
                                  ['clean']
                                ]
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Switch checked={published} onCheckedChange={setPublished} />
                            <Label>Publish</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={featured} onCheckedChange={setFeatured} />
                            <Label>Featured</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="whitespace-nowrap">Schedule (UTC)</Label>
                            <Input 
                              type="datetime-local" 
                              value={scheduledFor} 
                              onChange={(e) => setScheduledFor(e.target.value)}
                              className="bg-zinc-800 border-zinc-700 w-auto"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading || uploading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Saving...' : editingArticle ? 'Update' : 'Create'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-auto bg-zinc-900 border-zinc-800"
                      placeholder="Start Date"
                    />
                    <span className="text-zinc-500">-</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-auto bg-zinc-900 border-zinc-800"
                      placeholder="End Date"
                    />
                  </div>

                  {(userRole === 'superadmin' || userRole === 'moderator') && (
                    <Select value={authorFilter} onValueChange={setAuthorFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Filter by Author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Articles Table */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800">
                          <TableHead>Article</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-zinc-400">
                              No articles found
                            </TableCell>
                          </TableRow>
                        ) : (
                          articles.map((article) => (
                            <TableRow key={article.id} className="border-zinc-800">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {article.cover_image && (
                                    <img src={article.cover_image} alt="" className="h-10 w-14 rounded object-cover" />
                                  )}
                                  <div>
                                    <p className="font-medium text-white line-clamp-1">{article.title}</p>
                                    <p className="text-xs text-zinc-400">{new Date(article.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{article.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="uppercase">{article.language || 'en'}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={article.published} 
                                    onCheckedChange={() => togglePublish(article)}
                                    className={article.published ? 'data-[state=checked]:bg-green-600' : ''}
                                  />
                                  <span className="text-xs text-zinc-400">{article.published ? 'Published' : 'Draft'}</span>
                                </div>
                              </TableCell>
                              <TableCell>{article.view_count}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/en/article/${article.slug || article.id}`} target="_blank">
                                          <Eye className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Preview</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => { handleEdit(article); setShowForm(true); }}>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Page {currentPage} of {totalPages}</p>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">Profile</h1>
                  <p className="text-zinc-400 mt-1">Manage your public profile</p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profileAvatar} />
                        <AvatarFallback className="bg-red-500 text-white text-2xl">{profileName?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="avatar" className="cursor-pointer">
                          <div className="flex items-center space-x-2 px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                            <Upload className="h-4 w-4" />
                            <span>Change Photo</span>
                          </div>
                          <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setProfileImageFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => setProfileAvatar(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </Label>
                        <p className="mt-2 text-xs text-zinc-500">JPG, PNG. Max 2MB.</p>
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                          placeholder="e.g. Senior Editor"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="public@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Twitter URL</Label>
                        <Input
                          value={profileTwitter}
                          onChange={(e) => setProfileTwitter(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn URL</Label>
                        <Input
                          value={profileLinkedin}
                          onChange={(e) => setProfileLinkedin(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700" disabled={savingProfile}>
                        <Save className="mr-2 h-4 w-4" />
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">Job Applications</h1>
                  <p className="text-zinc-400 mt-1">Review submitted applications</p>
                </div>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <JobApplicationsAdmin session={session} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Partnerships Tab */}
            {activeTab === 'partnerships' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">Partnership Inquiries</h1>
                  <p className="text-zinc-400 mt-1">Manage partnership requests</p>
                </div>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <PartnershipInquiriesAdmin session={session} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Team Tab (Super Admin Only) */}
            {activeTab === 'team' && userRole === 'superadmin' && (
              <TeamManagement session={session} />
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
