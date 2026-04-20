'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, Bell, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchEvents, registerForEvent, cancelEventRegistration } from '@/lib/api';
import { getSession } from '@/lib/permissions';

interface Event {
  id: string | number;
  title: string;
  speaker: string;
  speakerSpecialty: string;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  status: 'available' | 'coming_soon' | 'past';
  type: string;
  color: string;
  initial: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'التعامل مع القلق في الحياة اليومية',
    speaker: 'د. أحمد محمود',
    speakerSpecialty: 'أخصائي نفسي',
    date: '٢٥ أبريل ٢٠٢٦',
    time: '٧ مساءً — ٨:٣٠ مساءً',
    registered: 87,
    capacity: 150,
    status: 'available',
    type: 'ندوة مجانية',
    color: 'bg-teal-100 text-teal-700',
    initial: 'أ',
  },
  {
    id: 2,
    title: 'كيف تبني علاقات صحية مع نفسك والناس',
    speaker: 'د. سارة حسين',
    speakerSpecialty: 'معالجة نفسية',
    date: '٢٨ أبريل ٢٠٢٦',
    time: '٥ مساءً — ٦:٣٠ مساءً',
    registered: 134,
    capacity: 200,
    status: 'available',
    type: 'ورشة عمل',
    color: 'bg-purple-100 text-purple-700',
    initial: 'س',
  },
  {
    id: 3,
    title: 'فهم الاكتئاب: أسبابه وعلاجه',
    speaker: 'د. خالد إبراهيم',
    speakerSpecialty: 'طبيب نفسي',
    date: '٣ مايو ٢٠٢٦',
    time: '٨ مساءً — ٩:٣٠ مساءً',
    registered: 0,
    capacity: 100,
    status: 'coming_soon',
    type: 'ندوة مجانية',
    color: 'bg-amber-100 text-amber-700',
    initial: 'خ',
  },
  {
    id: 4,
    title: 'تقنيات الاسترخاء والتنفس العميق',
    speaker: 'د. نورهان أحمد',
    speakerSpecialty: 'معالجة نفسية',
    date: '١٥ أبريل ٢٠٢٦',
    time: '٦ مساءً — ٧ مساءً',
    registered: 95,
    capacity: 100,
    status: 'past',
    type: 'ورشة عمل',
    color: 'bg-rose-100 text-rose-700',
    initial: 'ن',
  },
  {
    id: 5,
    title: 'الصحة النفسية للمراهقين',
    speaker: 'د. سارة حسين',
    speakerSpecialty: 'أخصائية نفسية للأطفال',
    date: '١٠ أبريل ٢٠٢٦',
    time: '٤ مساءً — ٥:٣٠ مساءً',
    registered: 68,
    capacity: 80,
    status: 'past',
    type: 'ندوة مجانية',
    color: 'bg-blue-100 text-blue-700',
    initial: 'س',
  },
];

export function EventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadEvents() {
    setIsLoading(true);
    try {
      const res = await fetchEvents();
      if (res.events && res.events.length > 0) {
        setEvents(res.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          speaker: e.speaker,
          speakerSpecialty: e.speakerSpecialty || '',
          date: e.date,
          time: e.time,
          registered: e.registered || 0,
          capacity: e.capacity || 100,
          status: e.status || 'available',
          type: e.type || 'ندوة مجانية',
          color: e.color || 'bg-teal-100 text-teal-700',
          initial: e.initial || e.speaker?.charAt(0) || '?',
        })));
      } else {
        setEvents(mockEvents);
      }
    } catch {
      setEvents(mockEvents);
    }
    setIsLoading(false);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadEvents();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const upcomingEvents = events.filter(e => e.status !== 'past');
  const pastEvents = events.filter(e => e.status === 'past');

  const handleRegister = async (eventId: string | number) => {
    const session = getSession();
    if (!session) return;

    const isRegistered = registeredEvents.includes(String(eventId));

    try {
      if (isRegistered) {
        await cancelEventRegistration(session.userId, String(eventId));
        setRegisteredEvents(prev => prev.filter(id => id !== String(eventId)));
      } else {
        await registerForEvent(session.userId, String(eventId));
        setRegisteredEvents(prev => [...prev, String(eventId)]);
      }
    } catch {
      // Fallback: toggle locally
      if (isRegistered) {
        setRegisteredEvents(prev => prev.filter(id => id !== String(eventId)));
      } else {
        setRegisteredEvents(prev => [...prev, String(eventId)]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">الفعاليات</h1>
        <p className="text-muted-foreground mt-1">ندوات وورش عمل مجانية مع متخصصين معتمدين</p>
      </div>

      {/* Info Banner */}
      <div className="bg-secondary rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-accent" />
          <span className="text-sm font-bold text-foreground">الفعاليات مجانية ومفتوحة للجميع</span>
        </div>
        <div className="flex items-center gap-2 sm:mr-auto">
          <Bell size={16} className="text-accent" />
          <span className="text-xs text-muted-foreground">هتوصل إيميل تأكيد + تذكير قبل الموعد</span>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4">الفعاليات القادمة</h2>
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const isRegistered = registeredEvents.includes(String(event.id));
            const fillPercent = Math.round((event.registered / event.capacity) * 100);

            return (
              <Card key={event.id} className="bg-card border-border hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Date Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl ${event.color} flex flex-col items-center justify-center`}>
                        <span className="text-lg font-bold">{event.date.split(' ')[0]}</span>
                        <span className="text-[10px]">{event.date.split(' ')[1]}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px]">
                              {event.type}
                            </Badge>
                            {event.status === 'coming_soon' && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">
                                قريباً
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-foreground text-base">{event.title}</h3>
                        </div>
                        {isRegistered && (
                          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Speaker */}
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${event.color} flex items-center justify-center font-bold text-[10px]`}>
                          {event.initial}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{event.speaker}</p>
                          <p className="text-[10px] text-muted-foreground">{event.speakerSpecialty}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {event.registered} / {event.capacity}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {event.status === 'available' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">المقاعد المتبقية</span>
                            <span className="text-[10px] font-medium text-foreground">{event.capacity - event.registered} مقعد</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${fillPercent > 80 ? 'bg-red-400' : 'bg-accent'}`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {event.status === 'available' && (
                        <Button
                          onClick={() => handleRegister(event.id)}
                          variant={isRegistered ? 'secondary' : 'default'}
                          className={`w-full sm:w-auto text-sm ${isRegistered ? '' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                        >
                          {isRegistered ? '✓ تم التسجيل — إلغاء' : 'سجّل الآن'}
                        </Button>
                      )}
                      {event.status === 'coming_soon' && (
                        <Button variant="outline" className="w-full sm:w-auto text-sm" disabled>
                          <Bell size={14} className="ml-1" />
                          نبّني لما يتاح
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">فعاليات سابقة</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="bg-card border-border opacity-75">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                      تم الانعقاد
                    </Badge>
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{event.speaker}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={12} />
                    <span>{event.registered} مشارك</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
