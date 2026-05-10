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

interface AppointmentInfo {
  id: string;
  appointmentDate: string;
  status: string;
  reason: string;
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
  appointment: AppointmentInfo | null;
  patientCanSend: boolean;
  sessionMessage: string;
  isPatient: boolean;
}

const MAX_RECORDING_SECONDS = 300; // 5 minutes

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user } = useAuth();
  const { roomId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordStartTimeRef = useRef<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const progressAnimRef = useRef<number>(0);

  // Determine the other person's info
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup audio + microphone on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  const patientBlocked = roomInfo?.isPatient && !roomInfo?.patientCanSend;

  const sendText = async () => {
    if (!text.trim() || sending || patientBlocked) return;
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

  // Voice recording with auto-stop at 5 minutes
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
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
          setUploadProgress(true);
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
              const errData = await res.json().catch(() => ({}));
              toast.error(errData.error || 'مش قادر ترسل الصوت');
            }
          } catch {
            toast.error('حصل خطأ في إرسال الصوت');
          } finally {
            setUploadProgress(false);
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

      recorder.start(250);
      setRecording(true);
      mediaRecorderRef.current = recorder;
      setRecordingDuration(0);
      recordStartTimeRef.current = Date.now();

      // Timer: update recording duration every second
      recordTimerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - recordStartTimeRef.current) / 1000);
        setRecordingDuration(elapsed);

        // Warning at 4:30
        if (elapsed === 270) {
          toast.warning('30 ثانية وبيخلص الوقت');
        }
        // Warning at 4:50
        if (elapsed === 290) {
          toast.warning('10 ثواني وبيخلص الوقت');
        }
      }, 1000);

      // Auto-stop at 5 minutes
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          toast('وصلت للحد الأقصى - 5 دقائق', { icon: '⏱️' });
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, MAX_RECORDING_SECONDS * 1000);

    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'الميكروفون مش متاح. سمح بالوصول للميكروفون من إعدادات المتصفح'
        : 'مش قادر أصل للميكروفون. تأكد إن المتصفح مسموحله';
      toast.error(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  };

  // Voice playback with progress tracking
  const toggleVoicePlayback = (msgId: string, voiceUrl: string) => {
    if (playingVoiceId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      setPlayingVoiceId(null);
      setPlaybackProgress(0);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);

    try {
      const audio = new Audio(voiceUrl);

      audio.onended = () => {
        setPlayingVoiceId(null);
        setPlaybackProgress(0);
        if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      };

      audio.onerror = () => {
        toast.error('مش قادر يشغل الرسالة الصوتية');
        setPlayingVoiceId(null);
        setPlaybackProgress(0);
      };

      // Track playback progress
      const updateProgress = () => {
        if (audio.duration && audio.duration > 0) {
          setPlaybackProgress(audio.currentTime / audio.duration);
        }
        if (playingVoiceId === msgId) {
          progressAnimRef.current = requestAnimationFrame(updateProgress);
        }
      };

      audio.play().then(() => {
        setPlayingVoiceId(msgId);
        setPlaybackProgress(0);
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => {
        toast.error('مش قادر يشغل الصوت');
        setPlayingVoiceId(null);
      });

      audioRef.current = audio;
    } catch {
      toast.error('مش قادر يشغل الصوت');
    }
  };

  // Seek to position on waveform click
  const seekVoice = (msgId: string, voiceUrl: string, fraction: number) => {
    if (playingVoiceId === msgId && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = fraction * audioRef.current.duration;
    } else {
      // Start playing and seek
      try {
        const audio = new Audio(voiceUrl);
        audio.onended = () => {
          setPlayingVoiceId(null);
          setPlaybackProgress(0);
          if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
        };
        audio.onerror = () => {
          toast.error('مش قادر يشغل الرسالة الصوتية');
          setPlayingVoiceId(null);
        };
        const updateProgress = () => {
          if (audio.duration && audio.duration > 0) {
            setPlaybackProgress(audio.currentTime / audio.duration);
          }
          if (playingVoiceId === msgId) {
            progressAnimRef.current = requestAnimationFrame(updateProgress);
          }
        };
        audio.play().then(() => {
          audio.currentTime = fraction * audio.duration;
          setPlayingVoiceId(msgId);
          setPlaybackProgress(fraction);
          progressAnimRef.current = requestAnimationFrame(updateProgress);
        }).catch(() => toast.error('مش قادر يشغل الصوت'));
        audioRef.current = audio;
      } catch {
        toast.error('مش قادر يشغل الصوت');
      }
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

  // Generate waveform bars from message id
  const getWaveformBars = (id: string, isSent: boolean, isPlaying: boolean) => {
    const bars: React.ReactNode[] = [];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
    for (let i = 0; i < 28; i++) {
      const h = ((seed * (i + 1) * 7) % 100) / 100;
      bars.push(
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-200 ${
            isSent
              ? isPlaying ? 'bg-white' : 'bg-white/50'
              : isPlaying ? 'bg-wesal-dark' : i < 14 ? 'bg-wesal-dark/30' : 'bg-wesal-medium/20'
          }`}
          style={{
            height: isPlaying
              ? `${Math.max(12, Math.min(100, h * 100 + Math.sin(Date.now() / 150 + i) * 25))}%`
              : `${Math.max(12, h * 100)}%`,
          }}
        />
      );
    }
    return bars;
  };

  // Calculate recording progress percentage for the progress bar
  const recordingProgress = Math.min((recordingDuration / MAX_RECORDING_SECONDS) * 100, 100);
  const isNearLimit = recordingDuration >= MAX_RECORDING_SECONDS - 30;

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
      {/* Chat Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-wesal-ice shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
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
            {roomInfo?.appointment && roomInfo?.isPatient && (
              <span className={`text-xs flex items-center gap-1 ${roomInfo.patientCanSend ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className="material-symbols-outlined text-xs">
                  {roomInfo.appointment.status === 'pending' ? 'schedule' : roomInfo.patientCanSend ? 'video_camera_front' : 'lock_clock'}
                </span>
                {roomInfo.sessionMessage}
              </span>
            )}
            {!roomInfo?.isPatient && (
              <span className="text-xs text-wesal-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                متصل الآن
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {roomInfo?.appointment && roomInfo?.isPatient && (
            <Link
              href={`/book/${roomInfo.doctorId}`}
              className="p-2 rounded-full hover:bg-wesal-ice transition-colors text-wesal-dark"
              aria-label="حجز موعد جديد"
            >
              <span className="material-symbols-outlined text-xl">event_available</span>
            </Link>
          )}
        </div>
      </header>

      {/* Session info banner for patient */}
      {roomInfo?.isPatient && roomInfo?.appointment && !roomInfo?.patientCanSend && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
          <span className="text-xs text-amber-700 font-medium">{roomInfo.sessionMessage}</span>
        </div>
      )}

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
          const isCurrentPlaying = playingVoiceId === msg.id;
          const currentProgress = isCurrentPlaying ? playbackProgress : 0;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
            >
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
                {!isMe && (
                  <span className="text-[11px] text-wesal-medium font-medium px-1">{senderName}</span>
                )}

                {msg.messageType === 'text' && (
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-wesal-dark text-white rounded-bl-sm shadow-md' : 'bg-white text-wesal-navy border border-wesal-ice rounded-br-sm shadow-sm'}`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}

                {msg.messageType === 'voice' && (
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-wesal-dark text-white rounded-bl-sm shadow-md' : 'bg-white text-wesal-navy border border-wesal-ice rounded-br-sm shadow-sm'} min-w-[220px]`}>
                    {/* Voice message content */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => msg.voiceUrl && toggleVoicePlayback(msg.id, msg.voiceUrl)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isMe
                            ? 'bg-white/20 text-white hover:bg-white/30 active:scale-90'
                            : 'bg-wesal-ice text-wesal-dark hover:bg-wesal-sky/30 active:scale-90'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${isPlaying ? 'filled' : ''}`}>
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      {/* Waveform with click-to-seek */}
                      <div
                        className="flex-1 flex items-center gap-[2px] h-9 px-1 cursor-pointer rounded-lg overflow-hidden relative"
                        onClick={(e) => {
                          if (!msg.voiceUrl) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          seekVoice(msg.id, msg.voiceUrl, fraction);
                        }}
                      >
                        {/* Progress overlay */}
                        {isPlaying && (
                          <div
                            className="absolute top-0 left-0 h-full rounded-l-lg z-0"
                            style={{
                              width: `${currentProgress * 100}%`,
                              backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(0,43,45,0.05)',
                              transition: 'width 0.1s linear',
                            }}
                          />
                        )}
                        {/* Playhead indicator */}
                        {isPlaying && (
                          <div
                            className="absolute top-0 z-10 w-[2px] h-full"
                            style={{
                              left: `${currentProgress * 100}%`,
                              backgroundColor: isMe ? 'rgba(255,255,255,0.6)' : 'rgba(0,43,45,0.3)',
                              transition: 'left 0.1s linear',
                            }}
                          />
                        )}
                        {/* Waveform bars */}
                        <div className="relative z-[1] flex items-center gap-[2px] h-full">
                          {getWaveformBars(msg.id, isMe, isPlaying)}
                        </div>
                      </div>

                      {/* Duration / Current time */}
                      <span className={`text-xs shrink-0 font-mono min-w-[36px] text-right ${
                        isMe ? 'text-white/70' : 'text-wesal-medium'
                      }`}>
                        {isPlaying && audioRef.current?.duration
                          ? (() => {
                              const current = Math.floor(audioRef.current.currentTime);
                              return `${Math.floor(current / 60)}:${(current % 60).toString().padStart(2, '0')}`;
                            })()
                          : msg.voiceDuration
                            ? `${Math.floor(msg.voiceDuration / 60)}:${(msg.voiceDuration % 60).toString().padStart(2, '0')}`
                            : '0:00'
                        }
                      </span>
                    </div>
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

        {/* Upload progress indicator */}
        {uploadProgress && (
          <div className="flex gap-2.5 max-w-[85%] self-end">
            <div className="bg-wesal-dark/80 text-white p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 min-w-[180px]">
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              <span className="text-sm">بيرفع الصوت...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Recording Indicator */}
      {recording && (
        <div className={`flex items-center gap-3 px-4 md:px-6 py-3 border-t ${isNearLimit ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200'}`}>
          <div className={`h-3 w-3 rounded-full ${isNearLimit ? 'bg-red-600 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
          <span className={`text-sm font-bold ${isNearLimit ? 'text-red-700' : 'text-red-600'}`}>
            {formatRecordingTime(recordingDuration)}
          </span>
          <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-red-600' : 'bg-red-400'}`}
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
          <span className={`text-sm font-medium hidden sm:block ${isNearLimit ? 'text-red-700' : 'text-red-600'}`}>
            {isNearLimit ? `متبقي ${MAX_RECORDING_SECONDS - recordingDuration} ثانية` : 'جاري التسجيل'}
          </span>
          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">stop</span>
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
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              disabled={recording || patientBlocked}
              placeholder={patientBlocked ? 'مش متقدر تبعت رسالة دلوقتي...' : 'اكتب رسالة...'}
            />
            <button aria-label="إضافة رموز تعبيرية" className="p-2.5 text-wesal-medium hover:text-wesal-dark transition-colors">
              <span className="material-symbols-outlined text-xl">mood</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 mb-1">
            <button
              aria-label={recording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
              onClick={recording ? stopRecording : (patientBlocked ? undefined : startRecording)}
              disabled={patientBlocked && !recording}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                recording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : patientBlocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-wesal-ice text-wesal-dark hover:bg-wesal-sky/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{recording ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              aria-label="إرسال"
              onClick={sendText}
              disabled={!text.trim() || sending || recording || patientBlocked}
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
