'use client';

import { useState } from 'react';
import { Star, Phone, MessageCircle, CheckCircle, Clock, Search, Filter, Stethoscope, Users, Baby, Home } from 'lucide-react';
import { getSession, setSession } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  category: string;
  rating: number;
  reviews: number;
  sessions: number;
  price: string;
  types: ('chat' | 'voice')[];
  bio: string;
  color: string;
  initial: string;
  availableTimes: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'د. أحمد محمود',
    specialty: 'أخصائي نفسي',
    category: 'نفسية',
    rating: 4.9,
    reviews: 87,
    sessions: 320,
    price: '٥٠ جنيه',
    types: ['chat', 'voice'],
    bio: 'أخصائي نفسي معتمد بخبرة ١٢ سنة في العلاج النفسي والسلوكي. متخصص في القلق والاكتئاب واضطرابات النوم. خريج كلية الطب — جامعة القاهرة.',
    color: 'bg-teal-100 text-teal-700',
    initial: 'أ',
    availableTimes: ['١٠ صباحاً', '١٢ ظهراً', '٢ مساءً', '٤ مساءً', '٦ مساءً'],
  },
  {
    id: 2,
    name: 'د. سارة حسين',
    specialty: 'أخصائية نفسية للأطفال',
    category: 'أطفال',
    rating: 4.8,
    reviews: 64,
    sessions: 210,
    price: '٦٠ جنيه',
    types: ['chat', 'voice'],
    bio: 'أخصائية نفسية للأطفال والمراهقين. معتمدة من الجمعية المصرية للصحة النفسية. متخصصة في صعوبات التعلم واضطراب فرط الحركة.',
    color: 'bg-purple-100 text-purple-700',
    initial: 'س',
    availableTimes: ['٩ صباحاً', '١١ صباحاً', '١ مساءً', '٣ مساءً'],
  },
  {
    id: 3,
    name: 'د. محمد عبدالرحمن',
    specialty: 'مستشار أسري',
    category: 'أسرة',
    rating: 4.7,
    reviews: 52,
    sessions: 180,
    price: '٥٥ جنيه',
    types: ['chat'],
    bio: 'مستشار أسري ومعالج زواجي معتمد. خبرة ١٥ سنة في حل النزاعات الأسرية وتحسين التواصل بين الأزواج. مدرب معتمد في العلاج العائلي.',
    color: 'bg-amber-100 text-amber-700',
    initial: 'م',
    availableTimes: ['١١ صباحاً', '٢ مساءً', '٥ مساءً', '٧ مساءً'],
  },
  {
    id: 4,
    name: 'د. نورهان أحمد',
    specialty: 'معالجة نفسية',
    category: 'نفسية',
    rating: 4.9,
    reviews: 95,
    sessions: 410,
    price: '٤٥ جنيه',
    types: ['chat', 'voice'],
    bio: 'معالجة نفسية متخصصة في العلاج بالكلام CBT والعلاج بقبول الالتزام ACT. خريجة الماجستير من جامعة عين شمس. حاصلة على دبلوم في العلاج النفسي من لندن.',
    color: 'bg-rose-100 text-rose-700',
    initial: 'ن',
    availableTimes: ['٨ صباحاً', '١٠ صباحاً', '١٢ ظهراً', '٣ مساءً', '٥ مساءً'],
  },
  {
    id: 5,
    name: 'د. خالد إبراهيم',
    specialty: 'طبيب نفسي',
    category: 'نفسية',
    rating: 4.6,
    reviews: 38,
    sessions: 120,
    price: '٧٠ جنيه',
    types: ['voice'],
    bio: 'طبيب نفسي معتمد وعضو الجمعية الأمريكية للطب النفسي. متخصص في تشخيص وعلاج الاكتئاب والاضطرابات ثنائية القطب.',
    color: 'bg-blue-100 text-blue-700',
    initial: 'خ',
    availableTimes: ['٢ مساءً', '٤ مساءً', '٦ مساءً', '٨ مساءً'],
  },
];

const categories = [
  { id: 'all', label: 'الكل', icon: Filter },
  { id: 'نفسية', label: 'نفسية', icon: Stethoscope },
  { id: 'أطفال', label: 'أطفال', icon: Baby },
  { id: 'أسرة', label: 'أسرة', icon: Users },
];

export function ConsultationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const filteredDoctors = mockDoctors.filter(doc => {
    const matchesSearch = doc.name.includes(searchQuery) || doc.specialty.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">الاستشارات</h1>
        <p className="text-muted-foreground mt-1">دكاترة معتمدين جاهزين يساعدوك في أي وقت</p>
      </div>

      {/* Info Banner */}
      <div className="bg-secondary rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle size={20} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">خصوصيتك مضمونة</p>
          <p className="text-xs text-muted-foreground mt-0.5">كل الاستشارات مشفرة ومجهولة. الدكتور مش بيشوف بياناتك الشخصية — بس المحادثة والتقرير النفسي.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن دكتور أو تخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card border-border text-foreground"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="bg-card border-border hover:shadow-lg hover:border-accent/30 transition-all cursor-pointer group"
            onClick={() => setSelectedDoctor(doctor)}
          >
            <CardContent className="p-5 space-y-4">
              {/* Doctor Header */}
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl ${doctor.color} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                  {doctor.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground text-sm truncate">{doctor.name}</p>
                    <CheckCircle size={14} className="text-accent flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground text-xs">{doctor.specialty}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-200'}
                      fill={i < Math.floor(doctor.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-xs text-foreground font-medium">{doctor.rating}</span>
                <span className="text-xs text-muted-foreground">({doctor.reviews} تقييم)</span>
              </div>

              {/* Session Info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {doctor.sessions} جلسة
                </span>
                <span className="flex items-center gap-1">
                  {doctor.types.map((type, idx) => type === 'chat' ? <MessageCircle key={idx} size={12} /> : <Phone key={idx} size={12} />)}
                  {doctor.types.includes('chat') && 'شات'}
                  {doctor.types.length > 1 && ' + '}
                  {doctor.types.includes('voice') && 'صوت'}
                </span>
              </div>

              {/* Price & Button */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-bold text-primary text-sm">{doctor.price}</span>
                <span className="text-[10px] text-muted-foreground">للجلسة</span>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoctor(doctor);
                  }}
                >
                  احجز جلسة
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Doctor Detail Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={() => { setSelectedDoctor(null); setSelectedTime(null); }}>
        <DialogContent className="bg-card max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${selectedDoctor.color} flex items-center justify-center font-bold text-2xl`}>
                    {selectedDoctor.initial}
                  </div>
                  <div>
                    <DialogTitle className="text-lg flex items-center gap-2">
                      {selectedDoctor.name}
                      <CheckCircle size={18} className="text-accent" />
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(selectedDoctor.rating) ? 'text-yellow-400' : 'text-gray-200'} fill={i < Math.floor(selectedDoctor.rating) ? 'currentColor' : 'none'} />
                      ))}
                      <span className="text-xs text-muted-foreground mr-1">({selectedDoctor.reviews} تقييم)</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Bio */}
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">عن الدكتور</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedDoctor.bio}</p>
                </div>

                {/* Session Types */}
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">أنواع الجلسات</h4>
                  <div className="flex gap-2">
                    {selectedDoctor.types.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type === 'chat' ? '💬 شات كتابي' : '📞 صوتي'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Available Times */}
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">الأوقات المتاحة</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">سعر الجلسة</p>
                    <p className="font-bold text-primary text-lg">{selectedDoctor.price}</p>
                  </div>
                  <Button
                    disabled={!selectedTime}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                    onClick={() => {
                      // تفعيل التراكر للمريض بعد الحجز
                      const session = getSession();
                      if (session) {
                        setSession({ ...session, trackerEnabled: true, followingDoctorId: String(selectedDoctor.id) });
                      }
                      setSelectedDoctor(null);
                      setSelectedTime(null);
                    }}
                  >
                    تأكيد الحجز
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
