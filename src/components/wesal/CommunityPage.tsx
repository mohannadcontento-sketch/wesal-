'use client';

import { useState } from 'react';
import { Heart, ThumbsUp, MessageCircle, Bookmark, Flag, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: number;
  author: string;
  authorInitial: string;
  authorColor: string;
  time: string;
  content: string;
  likes: number;
  helpfuls: number;
  comments: number;
  saved?: boolean;
  liked?: boolean;
  helpful?: boolean;
}

interface Comment {
  id: number;
  author: string;
  authorInitial: string;
  authorColor: string;
  time: string;
  content: string;
  helpfuls: number;
  replies?: Comment[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'مسافر #2487',
    authorInitial: 'م',
    authorColor: 'bg-teal-100 text-teal-700',
    time: 'منذ ساعتين',
    content: 'اليوم كان يوم صعب... حاسس بضغط كبير في الشغل ومش عارف أوازن بين حياتي الشخصية والمهنية. حد عنده تجربة مشابهة وعارف يتعامل إزاي مع الضغط ده؟',
    likes: 24,
    helpfuls: 8,
    comments: 5,
  },
  {
    id: 2,
    author: 'نسمة #3194',
    authorInitial: 'ن',
    authorColor: 'bg-purple-100 text-purple-700',
    time: 'منذ ٤ ساعات',
    content: 'عايزة أشكركم جميعاً هنا. المجتمع ده خلّاني أحس إني مش لوحدي. لأول مرة من فترة طويلة أحس إن في ناس بتفهمني. التراكر ساعدني ألاحظ إن مزاجي بيتحسن بالتدريج 💙',
    likes: 56,
    helpfuls: 22,
    comments: 12,
  },
  {
    id: 3,
    author: 'صباح #1523',
    authorInitial: 'ص',
    authorColor: 'bg-amber-100 text-amber-700',
    time: 'أمس',
    content: 'حبيت أشارك تجربتي مع جلسة الاستشارة الصوتية هنا. كنت متخوف في الأول لكن الدكتور كان لطيف جداً وسمعني كويس. ناصريني أدور على حلول عملية بدل ما أفتكر المشكلة بس.',
    likes: 89,
    helpfuls: 34,
    comments: 8,
  },
  {
    id: 4,
    author: 'قمر #4871',
    authorInitial: 'ق',
    authorColor: 'bg-rose-100 text-rose-700',
    time: 'منذ يومين',
    content: 'مين عنده نصايح للتخلص من الأفكار السلبية قبل النوم؟ جربت كتير حاجات بس لسه مش قادرة أنام كويس. التراكر بيوريني إن مستوى القلق عندي عالي في الليل.',
    likes: 41,
    helpfuls: 19,
    comments: 15,
  },
  {
    id: 5,
    author: 'فجر #6238',
    authorInitial: 'ف',
    authorColor: 'bg-blue-100 text-blue-700',
    time: 'منذ ٣ أيام',
    content: 'النهاردة خلصت ٣٠ يوم متتالية في التراكر! فخورة جداً بنفسي. في الأول كنت مش مصدقة إن مجرد كتابة إحساسي كل يوم هتعمل فرق، لكن فعلاً بقت أشوف نمط واضح وأفهم نفسي أكتر.',
    likes: 134,
    helpfuls: 52,
    comments: 21,
  },
];

const mockComments: Comment[] = [
  {
    id: 1,
    author: 'ليالي #7012',
    authorInitial: 'ل',
    authorColor: 'bg-pink-100 text-pink-700',
    time: 'منذ ساعة',
    content: 'أنا كمان كنت حاسسة بنفس الحاجة. اللي ساعدني هو التركيز على حاجة واحدة في كل مرة بدل ما أحاول أعمل كل حاجة مرة واحدة. وجربت تقسيم اليوم لفترات صغيرة.',
    helpfuls: 5,
    replies: [
      {
        id: 101,
        author: 'مسافر #2487',
        authorInitial: 'م',
        authorColor: 'bg-teal-100 text-teal-700',
        time: 'منذ ٣٠ دقيقة',
        content: 'شكراً ليالي! فكرة التقسيم تبدو عملية. هجربها النهاردة وأقولك النتيجة 💙',
        helpfuls: 2,
      },
    ],
  },
  {
    id: 2,
    author: 'بدر #5543',
    authorInitial: 'ب',
    authorColor: 'bg-indigo-100 text-indigo-700',
    time: 'منذ ٤٥ دقيقة',
    content: 'التنفس العميق قبل النوم ساعدني كتير. جرب تطبيق ٤-٧-٨: شهيق ٤ ثواني، حبس ٧ ثواني، زفير ٨ ثواني. كررها ٤ مرات.',
    helpfuls: 8,
  },
];

const quickEmojis = ['😊', '😔', '💪', '❤️', '🙏', '🤗', '💬', '✨'];

export function CommunityPage() {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(mockPosts);
  const [showEmojis, setShowEmojis] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: posts.length + 1,
      author: 'مسافر #' + Math.floor(Math.random() * 9000 + 1000),
      authorInitial: 'م',
      authorColor: 'bg-teal-100 text-teal-700',
      time: 'الآن',
      content: newPost,
      likes: 0,
      helpfuls: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setShowEmojis(false);
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleHelpful = (postId: number) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, helpful: !p.helpful, helpfuls: p.helpful ? p.helpfuls - 1 : p.helpfuls + 1 } : p
    ));
  };

  const toggleSave = (postId: number) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  };

  const addEmoji = (emoji: string) => {
    setNewPost(prev => prev + emoji);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">المجتمع</h1>
        <p className="text-muted-foreground mt-1">مساحة آمنة للتعبير عن مشاعرك مع ناس بيفهموك</p>
      </div>

      {/* Create Post */}
      <Card className="bg-card border-border mb-8">
        <CardContent className="p-5 space-y-4">
          <Textarea
            placeholder="اكتب إحساسك هنا... يمكن كلمة واحدة تغيّر كل حالة 💙"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] bg-background border-border resize-none text-foreground placeholder:text-muted-foreground/60"
          />

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="flex gap-2 flex-wrap bg-background rounded-xl p-3 border border-border animate-fade-in">
              {quickEmojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => addEmoji(emoji)}
                  className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="text-lg hover:scale-110 transition-transform"
              >
                😊
              </button>
              <p className="text-xs text-muted-foreground">
                تذكّر: المكان ده آمن ومجهول
              </p>
            </div>
            <Button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
            >
              <Send size={16} className="ml-1" />
              انشر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
              {/* Post Header */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${post.authorColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {post.authorInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{post.author}</p>
                  <p className="text-muted-foreground text-xs">{post.time}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    post.liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => toggleHelpful(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    post.helpful ? 'text-primary bg-secondary' : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>مفيد ({post.helpfuls})</span>
                </button>
                <button
                  onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
                >
                  <MessageCircle size={16} />
                  <span>{post.comments}</span>
                </button>
                <button
                  onClick={() => toggleSave(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    post.saved ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <Bookmark size={16} fill={post.saved ? 'currentColor' : 'none'} />
                </button>
                <button className="mr-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all">
                  <Flag size={14} />
                  بلّغ
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments === post.id && (
                <div className="border-t border-border pt-4 space-y-3 animate-fade-in">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full ${comment.authorColor} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                          {comment.authorInitial}
                        </div>
                        <div className="flex-1 bg-secondary/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground text-xs">{comment.author}</span>
                            <span className="text-muted-foreground text-[10px]">{comment.time}</span>
                          </div>
                          <p className="text-foreground/80 text-xs leading-relaxed">{comment.content}</p>
                          <button className="flex items-center gap-1 mt-2 text-muted-foreground hover:text-primary text-[10px]">
                            <ThumbsUp size={12} />
                            مفيد ({comment.helpfuls})
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies?.map((reply) => (
                        <div key={reply.id} className="mr-11 flex gap-2">
                          <div className={`w-6 h-6 rounded-full ${reply.authorColor} flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
                            {reply.authorInitial}
                          </div>
                          <div className="flex-1 bg-background rounded-lg p-2.5 border border-border">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-foreground text-[10px]">{reply.author}</span>
                              <span className="text-muted-foreground text-[10px]">{reply.time}</span>
                            </div>
                            <p className="text-foreground/80 text-[11px] leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-2 mr-11">
                    <input
                      type="text"
                      placeholder="اكتب تعليقك..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3">
                      <Send size={12} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
