'use client';

import Link from 'next/link';
import { Link2, Eye, Send, Bot, Check } from 'lucide-react';

// X (Twitter) SVG Icon
function XIcon({ size = 18, ...props }: { size?: number; [key: string]: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="currentColor"
      {...props}
    >
      <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
    </svg>
  );
}
import PodcastSection from '../../../../components/PodcastSection';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import slugify from 'slugify';
import { PODCASTS } from '../../../../lib/podcasts';
import { getDisplayViews } from '../../../../lib/viewUtils';

interface ArticleClientProps {
  article: any;
  relatedArticles: any[];
  featuredArticles: any[];
  lang?: string;
}

const TRANSLATIONS = {
  en: {
    aiQuickRead: 'AI Quick Read',
    generateAiQuickRead: 'Generate AI Quick Read',
    generating: 'Generating Summary...',
    askAi: 'Ask AI about this article',
    askPlaceholder: 'Ask a question...',
    sending: 'Thinking...',
    aiBot: 'Satoshi AI'
  },
  es: {
    aiQuickRead: 'Resumen IA',
    generateAiQuickRead: 'Generar Resumen IA',
    generating: 'Generando Resumen...',
    askAi: 'Preguntar a la IA sobre este artículo',
    askPlaceholder: 'Haz una pregunta...',
    sending: 'Pensando...',
    aiBot: 'Satoshi AI'
  },
  fr: {
    aiQuickRead: 'Résumé IA',
    generateAiQuickRead: 'Générer Résumé IA',
    generating: 'Génération du Résumé...',
    askAi: 'Demander à l\'IA à propos de cet article',
    askPlaceholder: 'Poser une question...',
    sending: 'Réflexion...',
    aiBot: 'Satoshi AI'
  },
  ar: {
    aiQuickRead: 'ملخص الذكاء الاصطناعي',
    generateAiQuickRead: 'توليد ملخص الذكاء الاصطناعي',
    generating: 'جاري التوليد...',
    askAi: 'اسأل الذكاء الاصطناعي عن هذا المقال',
    askPlaceholder: 'اطرح سؤالاً...',
    sending: 'يفكر...',
    aiBot: 'Satoshi AI'
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ArticleClient({ article, relatedArticles, featuredArticles, lang = 'en' }: ArticleClientProps) {
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  // Real-time view count — use calculated minimum so new articles never show 0
  const [viewCount, setViewCount] = useState(
    article?.created_at
      ? getDisplayViews(article.created_at, article.view_count || 0)
      : (article?.view_count || 0)
  );
  const [copied, setCopied] = useState(false);
  
  // AI Summary State
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Chat Bot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    const startTime = Date.now();

    try {
      // Truncate context to avoid token limits (approx 6000 chars)
      const truncatedContent = article.content.length > 6000 
        ? article.content.substring(0, 6000) + '...' 
        : article.content;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: `Title: ${article.title}\nAuthor: ${article.author?.name || 'Unknown'}\nDate: ${new Date(article.created_at).toLocaleDateString()}\nCategory: ${article.category}\n\nContent: ${truncatedContent}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure minimum 2 seconds thinking time
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Ensure minimum 2 seconds thinking time even on error
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));

      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Something went wrong. Please try again.'}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateSummary = () => {
    setIsAiGenerating(true);
    // Fake generation delay for effect
    setTimeout(() => {
      setIsAiGenerating(false);
      setShowAiSummary(true);
    }, 2000);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } else {
        // Fallback for environments where navigator.clipboard is not available
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
        } catch (err) {
          console.error('Copy failed', err);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const baseMessage = `Sharing this with you: "${article.title}"\n\nI found this article very insightful and wanted to share my personal opinion on it.`;
    const hashtag = "#Web3Instant";
    
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(baseMessage + '\n\n' + url + '\n\n' + hashtag)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  useEffect(() => {
    if (article?.id) {
      // Increment view count
      supabase.rpc('increment_view_count', { article_id: article.id }).then(() => {});
    }
  }, [article?.id]);

  useEffect(() => {
    if (article?.created_at) {
      setViewCount(getDisplayViews(article.created_at, article.view_count || 0));
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-slate-600 dark:text-zinc-400 mb-6">The article you're looking for doesn't exist.</p>
        <Link href="/en" className="hidden md:inline-flex text-brand-red hover:underline">← Back to Home</Link>
      </div>
    );
  }

  // Render content safely (handle HTML from rich text editor)
  const renderContent = () => {
    // If content has HTML tags, render as HTML
    if (/<[a-z][\s\S]*>/i.test(article.content || '')) {
      return (
        <div 
          className="max-w-none text-lg text-slate-800 dark:text-zinc-100
            [&_p]:mb-10 [&_p]:leading-[1.9] [&_p]:tracking-wide
            [&_h2]:mt-14 [&_h2]:mb-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white
            [&_ul]:my-10 [&_ul]:pl-6 [&_ul]:list-disc
            [&_ol]:my-10 [&_ol]:pl-6 [&_ol]:list-decimal
            [&_li]:mb-4 [&_li]:leading-relaxed
            [&_blockquote]:my-10 [&_blockquote]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-red [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-zinc-400
            [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
            [&_a]:text-slate-800 dark:[&_a]:text-zinc-100 [&_a]:no-underline [&_a:hover]:underline"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      );
    }
    // Otherwise render as paragraphs
    return (
      <div className="max-w-none text-lg">
        {(article.content || '').split('\n\n').map((paragraph: string, index: number) => (
          <p key={index} className="mb-10 text-slate-800 dark:text-zinc-100 leading-[1.9] tracking-wide">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300 min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="px-3 py-1 bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 text-brand-red dark:text-brand-red text-[10px] font-bold uppercase tracking-wider rounded-md">
                                {article.category}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center justify-between">
                            <Link href={`/authors/${slugify(article.author.name, { lower: true, strict: true })}`} className="flex items-center space-x-4 group">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                    <img src={article.author.avatar} alt={article.author.name} className="object-cover w-full h-full group-hover:opacity-80 transition-opacity" />
                                </div>
                                <div className="flex flex-col text-sm">
                                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-red transition-colors">
                                      {article.author.name}
                                      {article.author.role && <span className="text-slate-500 dark:text-zinc-500 font-normal ml-1">| {article.author.role}</span>}
                                    </span>
                                    <div className="flex items-center text-slate-500 dark:text-zinc-400 space-x-2">
                                        <span>{new Date(article.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>3 min read</span>
                                    </div>
                                </div>
                            </Link>
                            <div className="flex items-center space-x-2 text-slate-600 dark:text-zinc-400">
                                <Eye size={18} />
                                <span className="text-sm font-medium">{viewCount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="mb-6">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                            <img src={article.cover_image} alt={article.title} className="object-cover w-full h-full" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-zinc-500 italic">
                            {article.excerpt}
                        </p>
                    </div>
                    {/* AI Quick Read */}
                    {article.ai_summary && (
                      <div className="mb-10">
                        {!showAiSummary && !isAiGenerating && (
                          <button 
                            onClick={handleGenerateSummary}
                            className="w-full group relative rounded-xl p-[2px] transition-all duration-300 active:scale-[0.99]"
                          >
                            <div className="absolute inset-0 rounded-xl bg-slate-200 dark:bg-zinc-800 transition-all duration-300 group-hover:animate-border-flow group-hover:bg-gradient-to-r group-hover:from-[#4E85FE] group-hover:via-[#C77BFF] group-hover:to-[#4E85FE] group-hover:shadow-[0_0_20px_rgba(78,133,254,0.3)]" />
                            <div className="relative h-full w-full rounded-xl bg-slate-50 dark:bg-zinc-900/50 p-4 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-zinc-900">
                              <div className="flex items-center justify-start space-x-3">
                                <img src="/gemini-icon.svg" alt="AI" className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-medium text-sm text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                  {t.generateAiQuickRead}
                                </span>
                              </div>
                            </div>
                          </button>
                        )}

                        {isAiGenerating && (
                          <div className="rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                            <div className="flex items-center space-x-3 mb-4 opacity-50">
                              <img src="/gemini-icon.svg" alt="AI" className="w-6 h-6 animate-pulse" />
                              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{t.generating}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
                              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-full animate-pulse" />
                              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-5/6 animate-pulse" />
                            </div>
                          </div>
                        )}

                        {showAiSummary && (
                          <div className="rounded-xl bg-slate-50 dark:bg-zinc-900 border-l-4 border-[#9177c7] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center space-x-3 mb-4">
                              <img src="/gemini-icon.svg" alt="AI" className="w-6 h-6" />
                              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                {t.aiQuickRead}
                              </h3>
                            </div>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {article.ai_summary}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Article Content */}
                    <div className="article-content">
                        {renderContent()}
                    </div>

                    {/* AI Chat Bot Section */}
                    <div className="my-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all duration-300">
                      <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-brand-red/10 rounded-lg">
                            <Bot className="w-5 h-5 text-brand-red" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.askAi}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider font-medium">Powered by ElizaOS</p>
                          </div>
                        </div>
                      </div>
                      
                      {chatMessages.length > 0 && (
                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-zinc-950/30 border-t border-b border-slate-200 dark:border-zinc-800">
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-brand-red text-white rounded-br-none shadow-md' 
                                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-bl-none shadow-sm'
                              }`}>
                                {msg.role === 'assistant' && (
                                  <div className="flex items-center space-x-2 mb-2 opacity-50 text-xs border-b border-slate-100 dark:border-zinc-700/50 pb-1">
                                    <Bot size={12} />
                                    <span className="font-medium">{t.aiBot}</span>
                                  </div>
                                )}
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                <div className="flex items-center space-x-2 text-slate-500 dark:text-zinc-400 text-sm">
                                  <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  <span className="ml-2 text-xs font-medium">{t.sending}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                      )}

                      <form onSubmit={handleSendMessage} className="p-2 bg-white dark:bg-zinc-900">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={t.askPlaceholder}
                            disabled={isChatLoading}
                            className="w-full pl-4 pr-12 py-3 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={!chatInput.trim() || isChatLoading}
                            className={`absolute right-2 p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg disabled:opacity-50 transition-colors ${
                              chatInput.trim() 
                                ? 'text-brand-red' 
                                : 'text-slate-400 dark:text-zinc-500 hover:text-brand-red dark:hover:text-brand-red'
                            }`}
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Social Share Section */}
                    <div className="py-6 border-t border-slate-200 dark:border-zinc-800 my-8">
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Share this article</p>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => handleShare('twitter')}
                                className="p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-100 hover:text-sky-500 transition-colors"
                                title="Share on Twitter"
                            >
                                <XIcon size={18} />
                            </button>
                            <button 
                                onClick={handleCopyLink}
                                className={`p-2.5 rounded-full transition-colors ${
                                    copied 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                }`}
                                title={copied ? "Copied!" : "Copy link"}
                            >
                                {copied ? <Check size={18} /> : <Link2 size={18} className="-rotate-45" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Featured) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-32">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-5 bg-brand-red mr-3"></div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Featured</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {featuredArticles.map((item) => (
                                <Link key={item.id} href={`/${lang}/article/${item.slug || item.id}`} className="flex group">
                                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden mr-4">
                                        <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">{item.category}</span>
                                            <span className="text-[10px] text-slate-300 dark:text-zinc-600">•</span>
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white leading-snug group-hover:text-brand-red transition-colors line-clamp-3">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="flex items-center mb-8">
                <div className="w-1 h-6 bg-brand-red mr-3"></div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((relatedArticle) => (
                    <Link key={relatedArticle.id} href={`/${lang}/article/${relatedArticle.slug || relatedArticle.id}`} className="group">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                            <img 
                                src={relatedArticle.cover_image} 
                                alt={relatedArticle.title} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">{relatedArticle.category}</span>
                            <span className="text-[10px] text-slate-300 dark:text-zinc-600">•</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                {new Date(relatedArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-brand-red transition-colors line-clamp-2 mb-2">
                            {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">
                            {relatedArticle.excerpt}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
        )}

        {/* Podcast Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
             <PodcastSection 
                mainPodcast={PODCASTS[0]}
                listPodcasts={PODCASTS.slice(1)}
            />
        </div>
      </main>
    </div>
  );
}

