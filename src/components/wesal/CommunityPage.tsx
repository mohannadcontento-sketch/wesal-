'use client';

import { useState, useRef } from 'react';
import {
  Heart, ThumbsUp, MessageCircle, Bookmark, Flag, MoreHorizontal, Send,
  Plus, Image, BarChart3, Search, Bell, TrendingUp, Award, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Types ───
interface Post {
  id: number;
  author: string;
  authorInitial: string;
  authorColor: string;
  authorBadge?: string;
  time: string;
  content: string;
  likes: number;
  helpfuls: number;
  comments: number;
  shares: number;
  saved?: boolean;
  liked?: boolean;
  helpful?: boolean;
  isDoctor?: boolean;
}

interface Comment {
  id: number;
  author: string;
  authorInitial: string;
  authorColor: string;
  time: string;
  content: string;
  helpfuls: number;
  likes: number;
  isDoctor?: boolean;
  replies?: Comment[];
}

// ─── Mock Data ───
const mockStories = [
  { id: 1, name: 'نصائح اليوم', emoji: '💡', color: 'bg-gradient-to-br from-amber-400 to-orange-500', isSystem: true },
  { id: 2, name: 'مسافر #2487', emoji: '😊', color: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  { id: 3, name: 'نسمة #3194', emoji: '💪', color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { id: 4, name: 'صباح #1523', emoji: '❤️', color: 'bg-gradient-to-br from-rose-400 to-rose-600' },
  { id: 5, name: 'د. نورهان', emoji: '👩‍⚕️', color: 'bg-gradient-to-br from-blue-400 to-blue-600', isDoctor: true },
  { id: 6, name: 'فجر #6238', emoji: '✨', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
  { id: 7, name: 'قمر #4871', emoji: '🌙', color: 'bg-gradient-to-br from-slate-400 to-slate-600' },
  { id: 8, name: 'بدر #5543', emoji: '🌟', color: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
];

const mockPosts: Post[] = [
  {
    id: 1, author: 'مسافر #2487', authorInitial: 'م', authorColor: 'bg-teal-100 text-teal-700',
    time: 'منذ ساعتين',
    content: 'اليوم كان يوم صعب... حاسس بضغط كبير في الشغل ومش عارف أوازن بين حياتي الشخصية والمهنية. حد عنده تجربة مشابهة وعارف يتعامل إزاي مع الضغط ده؟\n\nالنهاردة حاولت أعمل تمارين تنفس بس مش شايف فرق كبير لسه 😔',
    likes: 24, helpfuls: 8, comments: 5, shares: 2,
  },
  {
    id: 2, author: 'نسمة #3194', authorInitial: 'ن', authorColor: 'bg-purple-100 text-purple-700',
    time: 'منذ ٤ ساعات',
    content: 'عايزة أشكركم جميعاً هنا. المجتمع ده خلّاني أحس إني مش لوحدي. لأول مرة من فترة طويلة أحس إن في ناس بتفهمني 💙\n\nالتسبيح والذكر ساعدني كتير الفترة دي. جربتها وهي فعلاً بتخفف التوتر. مين عنده تجربة مع التأمل؟',
    likes: 56, helpfuls: 22, comments: 12, shares: 5,
  },
  {
    id: 3, author: 'د. نورهان أحمد', authorInitial: 'ن', authorColor: 'bg-rose-100 text-rose-700', authorBadge: '✓ معتمد',
    time: 'أمس', isDoctor: true,
    content: '💡 نصيحة يوماً من دكتورة نورهان:\n\nكثير مننا بيعاني من "صيام عاطفي" — نمنع أنفسنا من التعبير عن المشاعر عشان نكون "أقوياء". لكن الحقيقة: التعبير عن المشاعر مش ضعف، ده شجاعة.\n\nحاولوا النهاردة تكتبوا ٣ حاجات بيحسوا بيها — حتى لو مش فاهمينها. الكتابة بتساعد المخ يرتّب الأفكار.',
    likes: 189, helpfuls: 87, comments: 23, shares: 15,
  },
  {
    id: 4, author: 'صباح #1523', authorInitial: 'ص', authorColor: 'bg-amber-100 text-amber-700',
    time: 'أمس',
    content: 'حبيت أشارك تجربتي مع جلسة الاستشارة الصوتية هنا. كنت متخوف في الأول لكن الدكتور كان لطيف جداً وسمعني كويس. ناصريني أدور على حلول عملية بدل ما أفتكر المشكلة بس.\n\nالسعر رمزي والنتيجة فاقت توقعاتي. أنصح كل حد يجرب 💙',
    likes: 89, helpfuls: 34, comments: 8, shares: 7,
  },
  {
    id: 5, author: 'قمر #4871', authorInitial: 'ق', authorColor: 'bg-rose-100 text-rose-700',
    time: 'منذ يومين',
    content: 'مين عنده نصايح للتخلص من الأفكار السلبية قبل النوم؟ جربت كتير حاجات بس لسه مش قادرة أنام كويس. التراكر بيوريني إن مستوى القلق عندي عالي في الليل.\n\nحاسسة إني محتاجة حد يديني خطوات عملية مش مجرد كلام.',
    likes: 41, helpfuls: 19, comments: 15, shares: 1,
  },
  {
    id: 6, author: 'فجر #6238', authorInitial: 'ف', authorColor: 'bg-blue-100 text-blue-700',
    time: 'منذ ٣ أيام',
    content: 'النهاردة خلصت ٣٠ يوم متتالية في التراكر! فخورة جداً بنفسي 🎉\n\nفي الأول كنت مش مصدقة إن مجرد كتابة إحساسي كل يوم هتعمل فرق، لكن فعلاً بقت أشوف نمط واضح وأفهم نفسي أكتر. الدكتور بتاعي قال إن التقدم عندي ملحوظ!',
    likes: 134, helpfuls: 52, comments: 21, shares: 10,
  },
];

const mockComments: Record<number, Comment[]> = {
  1: [
    { id: 101, author: 'ليالي #7012', authorInitial: 'ل', authorColor: 'bg-pink-100 text-pink-700', time: 'منذ ساعة', content: 'أنا كمان كنت حاسسة بنفس الحاجة. اللي ساعدني هو التركيز على حاجة واحدة في كل مرة. وجربت تقسيم اليوم لفترات صغيرة + breaks كل ٥٠ دقيقة. فرق كبير!', helpfuls: 5, likes: 3, replies: [
      { id: 1001, author: 'مسافر #2487', authorInitial: 'م', authorColor: 'bg-teal-100 text-teal-700', time: 'منذ ٣٠ دقيقة', content: 'شكراً ليالي! فكرة التقسيم عملية هجربها النهاردة 💙', helpfuls: 2, likes: 1 },
      { id: 1002, author: 'بدر #5543', authorInitial: 'ب', authorColor: 'bg-indigo-100 text-indigo-700', time: 'منذ ١٥ دقيقة', content: 'أنا بستخدم تقنية Pomodoro — ٢٥ دقيقة شغل + ٥ دقائق راحة. ممتازة!', helpfuls: 1, likes: 0 },
    ] },
    { id: 102, author: 'د. أحمد محمود', authorInitial: 'أ', authorColor: 'bg-teal-100 text-teal-700', time: 'منذ ٣٠ دقيقة', content: 'الضغط في الشغل بيأثر على كل جوانب حياتنا. نصيحتي: حط حدود واضحة بين وقت الشغل والوقت الشخصي. ممكن تبدأ بنص ساعة كل يوم تكون "وقتك" بس. ولو الاستمرار صعب، استشارة واحدة ممكن تساعدك تلاقي جذور الضغط.', helpfuls: 12, likes: 8, isDoctor: true },
  ],
  5: [
    { id: 501, author: 'بدر #5543', authorInitial: 'ب', authorColor: 'bg-indigo-100 text-indigo-700', time: 'منذ ٤٥ دقيقة', content: 'التنفس العميق قبل النوم ساعدني كتير. جرب تطبيق ٤-٧-٨: شهيق ٤ ثواني، حبس ٧ ثواني، زفير ٨ ثواني. كررها ٤ مرات. مع الوقت بتعود المخ يسترخي.', helpfuls: 8, likes: 5 },
    { id: 502, author: 'ليالي #7012', authorInitial: 'ل', authorColor: 'bg-pink-100 text-pink-700', time: 'منذ ٢٠ دقيقة', content: 'أنا كنت بنفس المشكلة! اللي فعلاً ساعدني هو: مش أستخدم الموبايل ساعة قبل النوم، وكتابة ٣ حاجات شاكرة عليها. الدكتور قال إن السهر على الموبايل بيخلي المخ في حالة "تنبيه" ومش بيقدر ينتقل للنوم.', helpfuls: 6, likes: 4 },
  ],
};

const quickEmojis = ['😊', '😔', '💪', '❤️', '🙏', '🤗', '💬', '✨', '😔', '😤', '😴', '🥰'];
const trendingTopics = [
  { label: 'القلق', count: '٢٣٤ منشور' },
  { label: 'تحسين النوم', count: '١٨٧ منشور' },
  { label: 'العلاقات', count: '١٥٦ منشور' },
  { label: 'الاكتئاب', count: '١٢٣ منشور' },
  { label: 'الثقة بالنفس', count: '٩٨ منشور' },
];

type FeedTab = 'latest' | 'trending' | 'doctors';

export function CommunityPage() {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(mockPosts);
  const [showEmojis, setShowEmojis] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [feedTab, setFeedTab] = useState<FeedTab>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now(),
      author: 'مسافر #' + Math.floor(Math.random() * 9000 + 1000),
      authorInitial: 'م',
      authorColor: 'bg-teal-100 text-teal-700',
      time: 'الآن',
      content: newPost,
      likes: 0, helpfuls: 0, comments: 0, shares: 0,
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
    setPosts(posts.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
  };

  const addComment = (postId: number) => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: Date.now(), author: 'مسافر #' + Math.floor(Math.random() * 9000 + 1000),
      authorInitial: 'م', authorColor: 'bg-teal-100 text-teal-700', time: 'الآن',
      content: newComment, helpfuls: 0, likes: 0,
    };
    if (!mockComments[postId]) mockComments[postId] = [];
    mockComments[postId].push(c);
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setNewComment('');
  };

  const filteredPosts = feedTab === 'doctors' ? posts.filter(p => p.isDoctor) : posts;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">المجتمع</h1>
          <p className="text-muted-foreground text-xs mt-0.5">مساحة آمنة للتعبير عن مشاعرك</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Bell size={18} className="text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Search size={18} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* ─── Stories ─── */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mockStories.map((story) => (
          <button key={story.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
            <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl ${story.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform border-2 ${story.isSystem ? 'border-amber-300' : 'border-white/30'}`}>
              {story.isSystem ? <BarChart3 size={24} className="text-white" /> : story.emoji}
            </div>
            <span className="text-[10px] text-muted-foreground max-w-[64px] truncate">
              {story.isDoctor ? 'د. ' : ''}{story.name}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Create Post Card ─── */}
      <Card className="bg-card border-border mb-5 overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              م
            </div>
            <div
              onClick={() => document.getElementById('post-textarea')?.focus()}
              className="flex-1 bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors"
            >
              اكتب إحساسك هنا...
            </div>
          </div>

          <Textarea
            id="post-textarea"
            placeholder="شاركنا إحساسك... التعبير عن مشاعرك خطوة شجاعة 💙"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[80px] bg-secondary/30 border-0 resize-none text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 rounded-xl text-sm"
            rows={3}
          />

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="flex gap-1.5 flex-wrap bg-secondary/50 rounded-xl p-2.5 border border-border animate-fade-in">
              {quickEmojis.map((emoji, i) => (
                <button key={i} onClick={() => setNewPost(prev => prev + emoji)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-lg transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button onClick={() => setShowEmojis(!showEmojis)} className="p-2 rounded-lg hover:bg-secondary text-lg transition-colors">😊</button>
              <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" aria-label="إضافة صورة"><Image size={18} /></button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
              <p className="text-[10px] text-muted-foreground mr-1">مجهول وآمن</p>
            </div>
            <Button onClick={handlePost} disabled={!newPost.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30 h-8 px-4 text-xs rounded-lg gap-1.5">
              <Send size={14} />
              نشر
            </Button>
          </div>
        </div>
      </Card>

      {/* ─── Feed Tabs ─── */}
      <div className="flex items-center gap-1 mb-4 bg-secondary/50 rounded-xl p-1">
        {[
          { id: 'latest' as FeedTab, label: 'أحدث', icon: Clock },
          { id: 'trending' as FeedTab, label: 'رائج', icon: TrendingUp },
          { id: 'doctors' as FeedTab, label: 'من الدكاترة', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFeedTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              feedTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Trending Topics (when trending tab) ─── */}
      {feedTab === 'trending' && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
          {trendingTopics.map((topic, i) => (
            <button key={i} className="flex-shrink-0 flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:border-accent/40 transition-colors">
              <TrendingUp size={12} />
              <span className="font-medium text-foreground">{topic.label}</span>
              <span className="text-[10px]">{topic.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Feed ─── */}
      <div className="space-y-4 pb-20">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="bg-card border-border overflow-hidden hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="p-4 pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${post.authorColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {post.authorInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-foreground text-sm">{post.author}</p>
                    {post.isDoctor && (
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[9px] px-1.5 py-0 h-4">✓ معتمد</Badge>
                    )}
                    {post.authorBadge && !post.isDoctor && (
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[9px] px-1.5 py-0 h-4">{post.authorBadge}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-[11px]">{post.time}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 py-3">
              <p className="text-foreground/85 text-sm leading-[1.8] whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Engagement Stats */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{post.likes + post.helpfuls} تفاعل</span>
                  <span>{post.comments} تعليق</span>
                </div>
                {post.shares > 0 && <span>{post.shares} مشاركة</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center border-t border-border mx-2">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all rounded-lg mx-1 my-1 ${
                  post.liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">أعجبني</span>
              </button>
              <button
                onClick={() => toggleHelpful(post.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all rounded-lg mx-1 my-1 ${
                  post.helpful ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <ThumbsUp size={18} />
                <span className="hidden sm:inline">مفيد</span>
              </button>
              <button
                onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all rounded-lg mx-1 my-1 ${
                  expandedComments === post.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <MessageCircle size={18} />
                <span className="hidden sm:inline">تعليق</span>
              </button>
              <button
                onClick={() => toggleSave(post.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all rounded-lg mx-1 my-1 ${
                  post.saved ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Bookmark size={18} fill={post.saved ? 'currentColor' : 'none'} />
              </button>
              <button className="flex items-center justify-center py-3 px-2 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all rounded-lg my-1">
                <Flag size={16} />
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments === post.id && (
              <div className="border-t border-border p-4 space-y-3 animate-fade-in bg-secondary/20">
                {/* Existing Comments */}
                {(mockComments[post.id] || []).map((comment) => (
                  <div key={comment.id} className="space-y-2.5">
                    <div className="flex gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${comment.authorColor} flex items-center justify-center font-bold text-[11px] flex-shrink-0`}>
                        {comment.authorInitial}
                      </div>
                      <div className="flex-1">
                        <div className="bg-card rounded-xl p-3 border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-foreground text-xs">{comment.author}</span>
                            {comment.isDoctor && (
                              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[8px] px-1 py-0 h-3.5">✓ معتمد</Badge>
                            )}
                            <span className="text-muted-foreground text-[10px]">{comment.time}</span>
                          </div>
                          <p className="text-foreground/80 text-xs leading-relaxed">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 px-2">
                          <button className="text-[10px] text-muted-foreground hover:text-red-500 flex items-center gap-0.5">
                            <Heart size={11} /> {comment.likes}
                          </button>
                          <button className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5">
                            <ThumbsUp size={11} /> مفيد {comment.helpfuls}
                          </button>
                          <button className="text-[10px] text-muted-foreground hover:text-foreground">رد</button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies?.map((reply) => (
                      <div key={reply.id} className="mr-10 flex gap-2">
                        <div className={`w-6 h-6 rounded-full ${reply.authorColor} flex items-center justify-center font-bold text-[9px] flex-shrink-0`}>
                          {reply.authorInitial}
                        </div>
                        <div className="flex-1 bg-card rounded-lg p-2.5 border border-border/50">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-foreground text-[10px]">{reply.author}</span>
                            <span className="text-muted-foreground text-[9px]">{reply.time}</span>
                          </div>
                          <p className="text-foreground/80 text-[11px] leading-relaxed">{reply.content}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <button className="text-[9px] text-muted-foreground hover:text-red-500 flex items-center gap-0.5">
                              <Heart size={10} /> {reply.likes}
                            </button>
                            <button className="text-[9px] text-muted-foreground hover:text-foreground">رد</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex gap-2 items-center pt-1">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    م
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="اكتب تعليقك..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                      className="flex-1 bg-card border border-border rounded-full px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <Button
                      size="sm"
                      onClick={() => addComment(post.id)}
                      disabled={!newComment.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8 p-0 rounded-full disabled:opacity-30 flex items-center justify-center"
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
