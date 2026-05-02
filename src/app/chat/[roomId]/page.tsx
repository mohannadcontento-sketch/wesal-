'use client';

import { useState, useEffect, useRef, use } from 'react';
import { motion } from 'framer-motion';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col flex-1 rounded-2xl border border-border-light shadow-md overflow-hidden bg-card"
        >
          {/* Chat Header */}
          <div className="gradient-primary flex items-center gap-3 p-4">
            <Link
              href="/doctors"
              className="btn btn-icon-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="avatar avatar-md bg-white/20 text-white ring-2 ring-white/30">
              <span className="text-sm">🏥</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-sm font-heading">شات مع الدكتور</h2>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/70">محادثة آمنة ومشفرة</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages overflow-y-auto p-4 bg-background/50 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <p className="text-body-md font-medium text-foreground">ابدأ المحادثة مع الدكتور</p>
                <p className="text-body-sm text-muted-foreground mt-1">رسائلك خاصة ومشفرة</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.userId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 ${
                      isMe
                        ? 'gradient-primary text-white rounded-2xl rounded-tl-sm'
                        : 'bg-muted text-foreground rounded-2xl rounded-tr-sm'
                    }`}
                  >
                    {msg.messageType === 'text' && (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}
                    {msg.messageType === 'voice' && (
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <button className="btn btn-icon-sm bg-white/20 hover:bg-white/30 text-white p-0 w-8 h-8">
                          <Play className="h-3.5 w-3.5" />
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
                        isMe ? 'text-white/50 text-left' : 'text-muted-foreground text-right'
                      }`}
                    >
                      {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Recording Indicator */}
          {recording && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive-light border-t border-destructive/10">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm text-destructive font-medium">جاري التسجيل...</span>
              <div className="flex-1" />
              <button
                onClick={stopRecording}
                className="btn btn-sm bg-destructive text-white hover:bg-destructive/90"
              >
                <MicOff className="h-4 w-4" />
                <span>إيقاف</span>
              </button>
            </div>
          )}

          {/* Chat Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border-light bg-card">
            <button
              className="btn btn-icon-sm btn-ghost text-muted-foreground"
              title="إرفاق ملف"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder={recording ? 'جاري التسجيل...' : 'اكتب رسالتك...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              disabled={recording}
              className="input flex-1 h-11 rounded-full bg-muted border-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <button
              onClick={recording ? stopRecording : startRecording}
              title={recording ? 'إيقاف التسجيل' : 'رسالة صوتية'}
              className={`btn btn-icon-sm ${
                recording
                  ? 'bg-destructive-light text-destructive hover:bg-destructive/10'
                  : 'btn-ghost text-muted-foreground'
              }`}
            >
              {recording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={sendText}
              disabled={!text.trim() || sending || recording}
              className="btn btn-primary btn-icon-sm disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
