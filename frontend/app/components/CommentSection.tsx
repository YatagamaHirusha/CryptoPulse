'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2, Edit2, Reply } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isAnonymous: boolean;
  likes: number;
  dislikes: number;
  replies: Comment[];
}

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    if (!isAnonymous && !authorName.trim()) {
      setShowNameInput(true);
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: isAnonymous ? 'Anonymous' : authorName,
      content: newComment,
      timestamp: new Date().toISOString(),
      isAnonymous,
      likes: 0,
      dislikes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setAuthorName('');
    setShowNameInput(false);
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const handleDislike = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
    ));
  };

  const handleDelete = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleEdit = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, content: editContent } : c
    ));
    setEditingId(null);
    setEditContent('');
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    
    const reply: Comment = {
      id: Date.now().toString(),
      author: replyAnonymous ? 'Anonymous' : replyAuthor,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isAnonymous: replyAnonymous,
      likes: 0,
      dislikes: 0,
      replies: []
    };

    setComments(comments.map(c => 
      c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
    ));
    
    setReplyingTo(null);
    setReplyContent('');
    setReplyAuthor('');
    setReplyAnonymous(false);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} border-b border-slate-200 dark:border-zinc-800 pb-4`}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">
            {comment.isAnonymous ? 'A' : comment.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.author}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {new Date(comment.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  className="px-3 py-1 bg-brand-red text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white text-xs rounded-md hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 dark:text-zinc-300 text-sm mb-3">{comment.content}</p>
          )}

          <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-zinc-400">
            <button 
              onClick={() => handleLike(comment.id)}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <ThumbsUp size={14} />
              <span>{comment.likes}</span>
            </button>
            <button 
              onClick={() => handleDislike(comment.id)}
              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
            >
              <ThumbsDown size={14} />
              <span>{comment.dislikes}</span>
            </button>
            <button 
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center space-x-1 hover:text-green-600 transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
            <button 
              onClick={() => handleEdit(comment.id)}
              className="flex items-center space-x-1 hover:text-yellow-600 transition-colors"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button 
              onClick={() => handleDelete(comment.id)}
              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                rows={3}
              />
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={replyAnonymous}
                    onChange={(e) => setReplyAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <span>Reply anonymously</span>
                </label>
              </div>
              {!replyAnonymous && (
                <input
                  type="text"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                />
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReply(comment.id)}
                  className="px-4 py-2 bg-brand-red text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Submit Reply
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white text-sm rounded-md hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-zinc-800 pt-12">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white mb-3"
          rows={4}
        />
        
        <div className="flex items-center space-x-4 mb-3">
          <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <span>Comment anonymously</span>
          </label>
        </div>

        {(!isAnonymous || showNameInput) && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white mb-3"
          />
        )}

        <button
          onClick={handleSubmitComment}
          className="px-6 py-3 bg-brand-red text-white font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
