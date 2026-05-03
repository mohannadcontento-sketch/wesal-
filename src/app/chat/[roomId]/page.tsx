'use client';

import { useState, useEffect, useRef, use } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowRight,
  Mic,
  MicOff,
  Paperclip,
  Play,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  senderId: string;
  messageType: string;
  content?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user } = useAuth();
  const { roomId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roomId) {
      fetch(`/api/chat/${roomId}/messages`).then(r => r.json()).then(data => {
        setMessages(data.messages || []);
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(() => {
      fetch(`/api/chat/${roomId}/messages`).then(r => r.json()).then(data => {
        setMessages(data.messages || []);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user?.userId || '',
      messageType: 'text',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    const sentText = text;
    setText('');
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        setText(sentText);
        toast.error('مش قادر ترسل الرسالة');
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setText(sentText);
      toast.error('حصل خطأ');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const res = await fetch(`/api/chat/${roomId}/voice`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ voiceData: base64, duration: 0 }),
            });
            if (res.ok) {
              const data = await res.json();
              setMessages(prev => [...prev, data.message]);
            }
          } catch { toast.error('حصل خطأ في إرسال الصوت'); }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch { toast.error('مش قادر أصل للميكروفون'); }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
    setMediaRecorder(null);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    return `منذ ${Math.floor(mins / 60)} ساعة`;
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-xl mx-auto">
        <Card className="flex flex-col flex-1 rounded-2xl border-gray-200 shadow-md overflow-hidden bg-white p-0">
          {/* Chat Header */}
          <div className="bg-teal-600 flex items-center gap-3 p-4">
            <Link
              href="/doctors"
              className="inline-flex items-center justify-center rounded-md bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm p-2 transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Avatar className="size-9 bg-white/20 text-white ring-2 ring-white/30">
              <AvatarFallback className="bg-white/20 text-white text-sm">
                🏥
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-sm">شات مع الدكتور</h2>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/70">محادثة آمنة ومشفرة</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 flex-1">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                  <Send className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">ابدأ المحادثة مع الدكتور</p>
                <p className="text-sm text-gray-500 mt-1">رسائلك خاصة ومشفرة</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-2xl rounded-tl-sm'
                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tr-sm'
                    }`}
                  >
                    {msg.messageType === 'text' && (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}
                    {msg.messageType === 'voice' && (
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <button className="inline-flex items-center justify-center rounded-md bg-white/20 hover:bg-white/30 text-white p-0 size-8 transition-colors">
                          <Play className="size-3.5" />
                        </button>
                        {/* Waveform placeholder */}
                        <div className="flex-1 flex items-center gap-0.5">
                          {Array.from({ length: 20 }).map((_, i) => {
                            const h = Math.random() * 16 + 4;
                            return (
                              <div
                                key={i}
                                className="w-0.5 bg-current opacity-50 rounded-full"
                                style={{ height: `${h}px` }}
                              />
                            );
                          })}
                        </div>
                        {msg.voiceDuration && (
                          <span className="text-[11px] opacity-70 whitespace-nowrap">{msg.voiceDuration}ث</span>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[10px] mt-1.5 block ${
                        isMe ? 'text-white/50 text-left' : 'text-gray-400 text-right'
                      }`}
                    >
                      {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Recording Indicator */}
          {recording && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-600 font-medium">جاري التسجيل...</span>
              <div className="flex-1" />
              <Button
                onClick={stopRecording}
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700 gap-1"
              >
                <MicOff className="h-4 w-4" />
                <span>إيقاف</span>
              </Button>
            </div>
          )}

          {/* Chat Input */}
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
            <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600" title="إرفاق ملف">
              <Paperclip className="size-5" />
            </Button>
            <input
              ref={inputRef}
              type="text"
              placeholder={recording ? 'جاري التسجيل...' : 'اكتب رسالتك...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              disabled={recording}
              className="flex-1 h-11 rounded-full bg-gray-100 border-none px-4 text-sm outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-50 placeholder:text-gray-400"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={recording ? stopRecording : startRecording}
              title={recording ? 'إيقاف التسجيل' : 'رسالة صوتية'}
              className={recording ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-gray-600'}
            >
              {recording ? (
                <MicOff className="size-5" />
              ) : (
                <Mic className="size-5" />
              )}
            </Button>
            <Button
              onClick={sendText}
              disabled={!text.trim() || sending || recording}
              size="icon-sm"
              className="bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
