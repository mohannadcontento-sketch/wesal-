'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/PageTransition';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface SenderInfo {
  name: string;
  avatarUrl?: string | null;
}

interface Message {
  id: string;
  senderId: string;
  messageType: string;
  content?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  createdAt: string;
  sender?: SenderInfo;
}

interface RoomInfo {
  id: string;
  status: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientAvatar?: string | null;
  doctorName: string;
  doctorAvatar?: string | null;
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user } = useAuth();
  const { roomId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordStartTimeRef = useRef<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Determine the other person's info (the one we're chatting with)
  const otherPerson = (() => {
    if (!roomInfo || !user) return { name: 'الدكتور', avatarUrl: null };
    if (user.role === 'doctor') {
      return { name: roomInfo.patientName, avatarUrl: roomInfo.patientAvatar };
    }
    return { name: roomInfo.doctorName, avatarUrl: roomInfo.doctorAvatar };
  })();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        if (data.room) setRoomInfo(data.room);
      }
    } catch {
      // ignore network errors during polling
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
    // Poll every 3 seconds for new messages
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  const sendText = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user?.userId || '',
      messageType: 'text',
      content: text,
      createdAt: new Date().toISOString(),
      sender: {
        name: user?.realName || 'أنت',
        avatarUrl: user?.avatarUrl || null,
      },
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
      textareaRef.current?.focus();
    }
  };

  // Voice recording with proper MIME type detection
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        // Clear recording timer
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }

        const finalDuration = Math.round((Date.now() - recordStartTimeRef.current) / 1000);

        if (finalDuration < 1 || chunks.length === 0) {
          stream.getTracks().forEach(t => t.stop());
          toast.error('التسجيل قصير أوف، سجّل أكتر من ثانية');
          return;
        }

        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const res = await fetch(`/api/chat/${roomId}/voice`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ voiceData: base64, duration: finalDuration }),
            });
            if (res.ok) {
              const data = await res.json();
              setMessages(prev => [...prev, data.message]);
              toast.success('تم إرسال الرسالة الصوتية');
            } else {
              toast.error('مش قادر ترسل الصوت');
            }
          } catch {
            toast.error('حصل خطأ في إرسال الصوت');
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.onerror = () => {
        toast.error('حصل خطأ في التسجيل');
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      };

      recorder.start(250); // Collect data every 250ms for better reliability
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingDuration(0);
      recordStartTimeRef.current = Date.now();

      // Start recording timer
      recordTimerRef.current = setInterval(() => {
        setRecordingDuration(Math.round((Date.now() - recordStartTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'الميكروفون مش متاح. سمح بالوصول للميكروفون من إعدادات المتصفح'
        : 'مش قادر أصل للميكروفون. تأكد إن المتصفح مسموحله';
      toast.error(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
    setMediaRecorder(null);
  };

  // Voice playback
  const toggleVoicePlayback = (msgId: string, voiceUrl: string) => {
    if (playingVoiceId === msgId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const audio = new Audio(voiceUrl);
      audio.onended = () => setPlayingVoiceId(null);
      audio.onerror = () => {
        toast.error('مش قادر يشغل الرسالة الصوتية');
        setPlayingVoiceId(null);
      };
      audio.play().catch(() => {
        toast.error('مش قادر يشغل الصوت');
        setPlayingVoiceId(null);
      });
      audioRef.current = audio;
      setPlayingVoiceId(msgId);
    } catch {
      toast.error('مش قادر يشغل الصوت');
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    if (hours < 12) return `${hours}:${mins} ص`;
    return `${hours - 12}:${mins} م`;
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
  const getWaveformBars = (id: string, isSent: boolean, isPlaying: boolean) => {
    const bars: React.ReactNode[] = [];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
    for (let i = 0; i < 20; i++) {
      const h = ((seed * (i + 1) * 7) % 100) / 100;
      bars.push(
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-300 ${
            isSent
              ? isPlaying ? 'bg-white' : 'bg-white/60'
              : isPlaying ? 'bg-wesal-dark' : i < 10 ? 'bg-wesal-dark/40' : 'bg-wesal-medium/30'
          }`}
          style={{
            height: isPlaying
              ? `${Math.max(15, Math.min(100, h * 100 + Math.sin(Date.now() / 200 + i) * 20))}%`
              : `${Math.max(15, h * 100)}%`,
          }}
        />
      );
    }
    return bars;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wesal-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-wesal-dark">progress_activity</span>
          <span className="text-sm text-wesal-medium">جاري تحميل المحادثة...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wesal-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-wesal-medium">lock</span>
          <p className="text-sm text-wesal-medium">سجل دخول الأول عشان توصل للشات</p>
          <Link href="/login" className="px-6 py-2 bg-wesal-dark text-white rounded-xl text-sm font-bold">سجل دخول</Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="flex flex-col h-screen bg-wesal-cream">
      {/* Chat Header - top-0 since chat page is standalone (no MainLayout) */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-wesal-ice shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            aria-label="العودة"
            className="p-1.5 rounded-full hover:bg-wesal-ice transition-colors text-wesal-dark"
          >
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </Link>
          <div className="relative">
            <UserAvatar
              avatarUrl={otherPerson.avatarUrl}
              username={otherPerson.name}
              size="md"
              className="!w-11 !h-11"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-wesal-navy leading-tight">{otherPerson.name}</h2>
            <span className="text-xs text-wesal-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              متصل الآن
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={roomInfo ? `/book/${roomInfo.doctorId}` : '#'}
            className="p-2 rounded-full hover:bg-wesal-ice transition-colors text-wesal-dark"
            aria-label="حجز موعد"
          >
            <span className="material-symbols-outlined text-xl">event_available</span>
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 pb-36">
        {/* Date Divider */}
        <div className="flex justify-center my-1">
          <span className="bg-wesal-ice/70 text-xs text-wesal-medium px-3 py-1 rounded-full font-medium">
            اليوم
          </span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-wesal-ice">
              <span className="material-symbols-outlined text-3xl text-wesal-dark">chat</span>
            </div>
            <p className="text-base font-medium text-wesal-navy">ابدأ المحادثة مع {otherPerson.name}</p>
            <p className="text-sm text-wesal-medium mt-1">رسائلك خاصة ومشفرة</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.userId;
          const senderName = msg.sender?.name || (isMe ? 'أنت' : otherPerson.name);
          const senderAvatar = msg.sender?.avatarUrl || (isMe ? user?.avatarUrl : otherPerson.avatarUrl);
          const isPlaying = playingVoiceId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
            >
              {/* Received message shows avatar */}
              {!isMe && (
                <div className="shrink-0 mt-auto">
                  <UserAvatar
                    avatarUrl={senderAvatar}
                    username={senderName}
                    size="sm"
                    className="!w-8 !h-8"
                  />
                </div>
              )}

              <div className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Show sender name for received messages */}
                {!isMe && (
                  <span className="text-[11px] text-wesal-medium font-medium px-1">{senderName}</span>
                )}

                {msg.messageType === 'text' && (
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-wesal-dark text-white rounded-bl-sm shadow-md' : 'bg-white text-wesal-navy border border-wesal-ice rounded-br-sm shadow-sm'}`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}

                {msg.messageType === 'voice' && (
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-wesal-dark text-white rounded-bl-sm shadow-md' : 'bg-white text-wesal-navy border border-wesal-ice rounded-br-sm shadow-sm'} flex items-center gap-3 min-w-[200px]`}>
                    <button
                      onClick={() => msg.voiceUrl && toggleVoicePlayback(msg.id, msg.voiceUrl)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isMe
                          ? 'bg-white/20 text-white hover:bg-white/30 active:scale-90'
                          : 'bg-wesal-ice text-wesal-dark hover:bg-wesal-sky/30 active:scale-90'
                      }`}
                    >
                      <span className="material-symbols-outlined filled text-2xl">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    {/* Waveform */}
                    <div className="flex-1 flex items-center gap-[2px] h-8 px-2 overflow-hidden">
                      {getWaveformBars(msg.id, isMe, isPlaying)}
                    </div>
                    <span className={`text-xs shrink-0 ${isMe ? 'text-white/70' : 'text-wesal-medium'}`}>
                      {msg.voiceDuration ? `${Math.floor(msg.voiceDuration / 60)}:${(msg.voiceDuration % 60).toString().padStart(2, '0')}` : '0:00'}
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`flex items-center gap-1 px-1 ${isMe ? '' : 'mr-1'}`}>
                  <span className="text-[11px] text-wesal-medium">{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span className={`material-symbols-outlined text-sm ${msg.id.startsWith('temp-') ? 'text-wesal-medium' : 'text-wesal-dark'}`}>done_all</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {sending && (
          <div className="flex gap-2.5 max-w-[85%] self-start">
            <div className="shrink-0 mt-auto">
              <UserAvatar
                avatarUrl={otherPerson.avatarUrl}
                username={otherPerson.name}
                size="sm"
                className="!w-8 !h-8"
              />
            </div>
            <div className="bg-white border border-wesal-ice p-4 rounded-2xl rounded-br-sm flex items-center gap-1.5 h-12">
              <div className="w-2 h-2 bg-wesal-medium rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-wesal-medium rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-wesal-medium rounded-full opacity-80 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Recording Indicator */}
      {recording && (
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-red-600 font-bold">{formatRecordingTime(recordingDuration)}</span>
          <div className="flex-1 h-1 bg-red-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <span className="text-sm text-red-600 font-medium">جاري التسجيل</span>
          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">mic_off</span>
            <span>إيقاف</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl p-3 border-t border-wesal-ice shadow-[0_-2px_16px_0_rgba(0,43,45,0.04)]">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Attach Button */}
          <button aria-label="إرفاق ملف" className="p-1.5 text-wesal-dark hover:bg-wesal-ice rounded-full transition-colors mb-1">
            <span className="material-symbols-outlined text-xl">attach_file</span>
          </button>

          {/* Text Input */}
          <div className="flex-1 bg-wesal-cream border border-wesal-ice rounded-2xl flex items-end focus-within:border-wesal-dark focus-within:ring-1 focus-within:ring-wesal-dark/20 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[15px] p-3 text-wesal-navy placeholder:text-wesal-medium/50 max-h-32"
              placeholder="اكتب رسالة..."
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              disabled={recording}
            />
            <button aria-label="إضافة رموز تعبيرية" className="p-2.5 text-wesal-medium hover:text-wesal-dark transition-colors">
              <span className="material-symbols-outlined text-xl">mood</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 mb-1">
            <button
              aria-label={recording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
              onClick={recording ? stopRecording : startRecording}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                recording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-wesal-ice text-wesal-dark hover:bg-wesal-sky/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{recording ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              aria-label="إرسال"
              onClick={sendText}
              disabled={!text.trim() || sending || recording}
              className="p-2.5 rounded-full bg-wesal-dark text-white hover:bg-wesal-navy shadow-md transition-all active:scale-90 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-xl rotate-180 filled">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
