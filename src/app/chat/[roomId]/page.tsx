'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const formatTime = (date: string) => {
    const d = new Date(date);
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    if (hours < 12) return `${hours}:${mins} ص`;
    return `${hours - 12}:${mins} م`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  };

  // Generate consistent waveform bars from message id
  const getWaveformBars = (id: string, isSent: boolean) => {
    const bars: React.ReactNode[] = [];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
    for (let i = 0; i < 15; i++) {
      const h = ((seed * (i + 1) * 7) % 100) / 100;
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full ${isSent ? 'bg-on-primary' : i < 5 ? 'bg-primary/60' : 'bg-surface-dim'}`}
          style={{ height: `${Math.max(20, h * 100)}%` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header - Glassmorphism */}
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-surface-dim shadow-[0_4px_24px_0_rgba(0,43,45,0.05)]">
        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            aria-label="العودة"
            className="p-1 rounded-full hover:bg-surface-container transition-colors text-primary"
          >
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </Link>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center border-2 border-surface shadow-sm">
              <span className="material-symbols-outlined text-xl text-on-primary-fixed">medical_services</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-on-surface">الدكتور</h2>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              متصل الآن
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="مكالمة فيديو" className="p-1 rounded-full hover:bg-surface-container transition-colors text-primary">
            <span className="material-symbols-outlined text-2xl">videocam</span>
          </button>
          <button aria-label="مكالمة صوتية" className="p-1 rounded-full hover:bg-surface-container transition-colors text-primary">
            <span className="material-symbols-outlined text-2xl">call</span>
          </button>
          <button aria-label="خيارات إضافية" className="p-1 rounded-full hover:bg-surface-container transition-colors text-primary">
            <span className="material-symbols-outlined text-2xl">more_vert</span>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 pb-32">
        {/* Date Divider */}
        <div className="flex justify-center my-1">
          <span className="bg-surface-container-low text-xs text-on-surface-variant px-3 py-1 rounded-full border border-surface-dim font-medium">
            اليوم
          </span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
              <span className="material-symbols-outlined text-3xl text-primary-container">chat</span>
            </div>
            <p className="text-base font-medium text-on-surface">ابدأ المحادثة مع الدكتور</p>
            <p className="text-sm text-on-surface-variant mt-1">رسائلك خاصة ومشفرة</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.userId;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
            >
              {/* Received message shows avatar */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center shrink-0 mt-auto hidden sm:flex">
                  <span className="material-symbols-outlined text-sm text-on-primary-fixed">medical_services</span>
                </div>
              )}

              <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                {msg.messageType === 'text' && (
                  <div className={`${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'} p-3 rounded-2xl ${isMe ? 'rounded-bl-sm shadow-md' : 'rounded-br-sm shadow-sm'}`}>
                    <p className="text-base leading-relaxed">{msg.content}</p>
                  </div>
                )}

                {msg.messageType === 'voice' && (
                  <div className={`${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'} p-3 rounded-2xl ${isMe ? 'rounded-bl-sm shadow-md' : 'rounded-br-sm shadow-sm'} flex items-center gap-3 min-w-[180px]`}>
                    <button className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed hover:bg-inverse-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined filled">play_arrow</span>
                    </button>
                    {/* Waveform */}
                    <div className="flex-1 flex items-center gap-[2px] h-8 px-2 overflow-hidden">
                      {getWaveformBars(msg.id, isMe)}
                    </div>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      {msg.voiceDuration ? `${msg.voiceDuration}:${(msg.voiceDuration % 60).toString().padStart(2, '0')}` : '0:00'}
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`flex items-center gap-1 ${isMe ? '' : 'mr-1'}`}>
                  <span className="text-xs text-on-surface-variant">{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span className="material-symbols-outlined text-sm text-surface-dim">done_all</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {sending && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center shrink-0 mt-auto hidden sm:flex">
              <span className="material-symbols-outlined text-sm text-on-primary-fixed">medical_services</span>
            </div>
            <div className="chat-bubble-received p-4 rounded-2xl rounded-br-sm flex items-center gap-1.5 h-12">
              <div className="w-2 h-2 bg-on-surface-variant rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-on-surface-variant rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-on-surface-variant rounded-full opacity-80 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Recording Indicator */}
      {recording && (
        <div className="flex items-center gap-2 px-6 py-2 bg-error-container/50 border-t border-error/20">
          <div className="h-2.5 w-2.5 rounded-full bg-error animate-pulse" />
          <span className="text-sm text-error font-medium">جاري التسجيل...</span>
          <div className="flex-1" />
          <button
            onClick={stopRecording}
            className="flex items-center gap-1 px-3 py-1.5 bg-error text-on-error rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">mic_off</span>
            <span>إيقاف</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 w-full glass-panel p-3 border-t border-surface-dim shadow-[0_-4px_24px_0_rgba(0,43,45,0.05)]">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Attach Button */}
          <button aria-label="إرفاق ملف" className="p-1 text-primary hover:bg-surface-container rounded-full transition-colors mb-1">
            <span className="material-symbols-outlined text-2xl">attach_file</span>
          </button>

          {/* Text Input */}
          <div className="flex-1 bg-surface-container-low border border-surface-dim rounded-2xl flex items-end focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all shadow-inner overflow-hidden">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-base p-3 text-on-surface placeholder:text-on-surface-variant/50 max-h-32"
              placeholder="اكتب رسالة..."
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              disabled={recording}
            />
            <button aria-label="إضافة رموز تعبيرية" className="p-3 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">mood</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 mb-1">
            <button
              aria-label="تسجيل صوتي"
              onClick={recording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition-colors ${recording ? 'bg-error text-on-error' : 'bg-surface-container-high text-primary hover:bg-surface-dim'}`}
            >
              <span className="material-symbols-outlined text-2xl">{recording ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              aria-label="إرسال"
              onClick={sendText}
              disabled={!text.trim() || sending || recording}
              className="p-2 rounded-full bg-primary text-on-primary hover:bg-surface-tint shadow-md transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-2xl rotate-180 filled">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
