'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
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
  isAdmin?: boolean;
  isClosed?: boolean;
}

const MAX_RECORDING_SECONDS = 300;

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
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recordStartTimeRef = useRef<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const progressAnimRef = useRef<number>(0);

  const otherPerson = (() => {
    if (!roomInfo || !user) return { name: 'الدكتور', avatarUrl: null };
    if (user.role === 'admin') {
      // Admin: show the other person
      return user.id === roomInfo.patientId
        ? { name: roomInfo.doctorName, avatarUrl: roomInfo.doctorAvatar }
        : { name: roomInfo.patientName, avatarUrl: roomInfo.patientAvatar };
    }
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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
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

  const patientBlocked = !roomInfo?.patientCanSend;

  const handleRoomAction = async (action: 'close' | 'open' | 'delete') => {
    setShowMenu(false);
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/chat/rooms/${roomId}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('تم حذف المحادثة');
          window.location.href = '/chat';
        } else toast.error('مش قادر يحذف');
      } else {
        const res = await fetch(`/api/chat/rooms/${roomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action === 'close' ? 'closed' : 'open' }),
        });
        if (res.ok) {
          toast.success(action === 'close' ? 'تم إغلاق المحادثة' : 'تم فتح المحادثة');
          fetchMessages();
        } else toast.error('حصل خطأ');
      }
    } catch { toast.error('حصل خطأ'); }
  };

  const sendText = async () => {
    if (!text.trim() || sending || patientBlocked) return;
    setSending(true);
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user?.userId || '',
      messageType: 'text',
      content: text,
      createdAt: new Date().toISOString(),
      sender: { name: user?.realName || 'أنت', avatarUrl: user?.avatarUrl || null },
    };
    setMessages(prev => [...prev, optimisticMsg]);
    const sentText = text;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
        if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
        const finalDuration = Math.round((Date.now() - recordStartTimeRef.current) / 1000);
        if (finalDuration < 1 || chunks.length === 0) {
          stream.getTracks().forEach(t => t.stop());
          toast.error('التسجيل قصير أوي');
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
          } catch { toast.error('حصل خطأ في إرسال الصوت'); }
          finally { setUploadProgress(false); }
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
      recordTimerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - recordStartTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        if (elapsed === 270) toast.warning('30 ثانية وبيخلص الوقت');
        if (elapsed === 290) toast.warning('10 ثواني وبيخلص الوقت');
      }, 1000);
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          toast('وصلت للحد الأقصى - 5 دقائق');
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'سمح بالوصول للميكروفون من إعدادات المتصفح'
        : 'مش قادر أصل للميكروفون';
      toast.error(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
  };

  const toggleVoicePlayback = (msgId: string, voiceUrl: string) => {
    if (playingVoiceId === msgId) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      setPlayingVoiceId(null); setPlaybackProgress(0);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    try {
      const audio = new Audio(voiceUrl);
      audio.onended = () => { setPlayingVoiceId(null); setPlaybackProgress(0); if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current); };
      audio.onerror = () => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); setPlaybackProgress(0); };
      const updateProgress = () => {
        if (audio.duration && audio.duration > 0) setPlaybackProgress(audio.currentTime / audio.duration);
        if (playingVoiceId === msgId) progressAnimRef.current = requestAnimationFrame(updateProgress);
      };
      audio.play().then(() => {
        setPlayingVoiceId(msgId); setPlaybackProgress(0);
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); });
      audioRef.current = audio;
    } catch { toast.error('مش قادر يشغل الصوت'); }
  };

  const seekVoice = (msgId: string, voiceUrl: string, fraction: number) => {
    if (playingVoiceId === msgId && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = fraction * audioRef.current.duration;
    } else {
      try {
        const audio = new Audio(voiceUrl);
        audio.onended = () => { setPlayingVoiceId(null); setPlaybackProgress(0); if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current); };
        audio.onerror = () => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); };
        const updateProgress = () => {
          if (audio.duration && audio.duration > 0) setPlaybackProgress(audio.currentTime / audio.duration);
          if (playingVoiceId === msgId) progressAnimRef.current = requestAnimationFrame(updateProgress);
        };
        audio.play().then(() => {
          audio.currentTime = fraction * audio.duration;
          setPlayingVoiceId(msgId); setPlaybackProgress(fraction);
          progressAnimRef.current = requestAnimationFrame(updateProgress);
        }).catch(() => toast.error('مش قادر يشغل الصوت'));
        audioRef.current = audio;
      } catch { toast.error('مش قادر يشغل الصوت'); }
    }
  };

  const formatSessionMessage = (msg: string) => {
    if (msg.startsWith('appointment_time:')) {
      const isoStr = msg.replace('appointment_time:', '');
      const d = new Date(isoStr);
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: tz });
    }
    return msg;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hours = parseInt(d.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz }));
    const mins = d.toLocaleString('en-US', { minute: '2-digit', timeZone: tz });
    if (hours < 12) return `${hours === 0 ? 12 : hours}:${mins} ص`;
    return `${hours === 12 ? 12 : hours - 12}:${mins} م`;
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const getWaveformBars = (id: string, isSent: boolean, isPlaying: boolean) => {
    const bars: React.ReactNode[] = [];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
    for (let i = 0; i < 28; i++) {
      const h = ((seed * (i + 1) * 7) % 100) / 100;
      bars.push(
        <div key={i} className={`w-[2px] rounded-full transition-all duration-200 ${
          isSent
            ? isPlaying ? 'bg-white' : 'bg-white/50'
            : isPlaying ? 'bg-[#075E54]' : 'bg-gray-400/40'
        }`}
        style={{ height: `${Math.max(12, h * 100)}%` }} />
      );
    }
    return bars;
  };

  const recordingProgress = Math.min((recordingDuration / MAX_RECORDING_SECONDS) * 100, 100);
  const isNearLimit = recordingDuration >= MAX_RECORDING_SECONDS - 30;

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#ECE5DD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#075E54]">جاري تحميل المحادثة...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#ECE5DD]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-[#075E54]">lock</span>
          <p className="text-sm text-[#075E54]">سجل دخول الأول</p>
          <Link href="/login" className="px-6 py-2.5 bg-[#25D366] text-white rounded-lg text-sm font-bold">سجل دخول</Link>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const isSentByMe = (senderId: string) => senderId === user?.userId;
  const isBlocked = patientBlocked || roomInfo?.isClosed;

  return (
    <div className="flex flex-col h-screen bg-[#ECE5DD]">

      {/* WhatsApp-style Header */}
      <header className="sticky top-0 z-40 bg-[#075E54] text-white px-2 py-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="relative">
              <UserAvatar avatarUrl={otherPerson.avatarUrl} username={otherPerson.name} size="md" className="!w-10 !h-10 ring-2 ring-white/30" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[15px] font-semibold leading-tight">{otherPerson.name}</h2>
              {roomInfo?.appointment && roomInfo?.isPatient ? (
                <span className={`text-[11px] ${roomInfo.patientCanSend ? 'text-green-300' : 'text-amber-300'}`}>
                  {formatSessionMessage(roomInfo.sessionMessage)}
                </span>
              ) : !roomInfo?.isPatient ? (
                <span className="text-[11px] text-green-300">متصل</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {roomInfo?.appointment && roomInfo?.isPatient && (
              <Link href={`/book/${roomInfo.doctorId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="حجز موعد">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[22px]">more_vert</span>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 bg-white text-[#075E54] rounded-lg shadow-xl py-1 min-w-[180px]">
                    {roomInfo?.isClosed ? (
                      <button onClick={() => handleRoomAction('open')} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-[#25D366]">lock_open</span>
                        فتح المحادثة
                      </button>
                    ) : (
                      <button onClick={() => handleRoomAction('close')} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-amber-500">lock</span>
                        إغلاق المحادثة
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => handleRoomAction('delete')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                      حذف المحادثة
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Info banners */}
      {roomInfo?.isPatient && roomInfo?.appointment && !roomInfo?.patientCanSend && !roomInfo?.isClosed && (
        <div className="bg-[#FFF9C4] px-4 py-2 text-center border-b border-[#FFF176]">
          <span className="text-xs text-[#F57F17] font-medium">{formatSessionMessage(roomInfo.sessionMessage)}</span>
        </div>
      )}
      {roomInfo?.isClosed && (
        <div className="bg-[#FFCDD2] px-4 py-2 text-center border-b border-[#EF9A9A] flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-red-700 text-sm">lock</span>
          <span className="text-xs text-[#C62828] font-medium">المحادثة مقفلة</span>
        </div>
      )}

      {/* Chat Background Pattern + Messages */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 py-2" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>

        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date Divider */}
            <div className="flex justify-center my-2">
              <span className="bg-white/90 backdrop-blur-sm text-[11px] text-[#075E54] px-3 py-1 rounded-lg shadow-sm font-medium">
                {group.date}
              </span>
            </div>

            {group.messages.map((msg) => {
              const isMe = isSentByMe(msg.senderId);
              const senderName = msg.sender?.name || (isMe ? 'أنت' : otherPerson.name);
              const senderAvatar = msg.sender?.avatarUrl || (isMe ? user?.avatarUrl : otherPerson.avatarUrl);
              const isPlaying = playingVoiceId === msg.id;
              const currentProgress = isPlaying ? playbackProgress : 0;
              const isTemp = msg.id.startsWith('temp-');

              // Check if we should show sender avatar (first message from this sender in group or after a gap)
              const msgIndex = messages.findIndex(m => m.id === msg.id);
              const prevMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-1`}>
                  <div className={`flex items-end gap-1.5 max-w-[80%] ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>

                    {/* Avatar - only show for other person and when needed */}
                    {!isMe && (
                      <div className={`w-8 shrink-0 ${showAvatar ? 'mb-6' : 'invisible'}`}>
                        <UserAvatar avatarUrl={senderAvatar} username={senderName} size="sm" className="!w-7 !h-7" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`relative ${isMe ? 'order-1' : ''}`}>
                      {msg.messageType === 'text' && (
                        <div className={`relative px-2.5 pt-1.5 pb-1 shadow-sm ${
                          isMe
                            ? 'bg-[#DCF8C6] rounded-lg rounded-tr-none'
                            : 'bg-white rounded-lg rounded-tl-none'
                        }`}>
                          {/* Tail */}
                          {!isMe && (
                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white" />
                          )}
                          {isMe && (
                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-[#DCF8C6]" />
                          )}

                          {/* Sender name for admin chats */}
                          {!isMe && showAvatar && (
                            <p className="text-[11px] font-semibold text-[#25D366] mb-0.5">{senderName}</p>
                          )}

                          <div className="flex items-end gap-1.5">
                            <p className="text-[14.5px] text-[#111B21] leading-[19px] whitespace-pre-wrap break-words">{msg.content}</p>
                            <span className="flex items-center gap-0.5 shrink-0 translate-y-[3px]">
                              <span className="text-[10px] text-gray-500 leading-none">{formatTime(msg.createdAt)}</span>
                              {isMe && (
                                <span className={`material-symbols-outlined ${isTemp ? 'text-gray-400' : 'text-blue-400'}`} style={{ fontSize: 16 }}>
                                  done_all
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {msg.messageType === 'voice' && (
                        <div className={`px-2.5 pt-1.5 pb-1.5 shadow-sm min-w-[240px] ${
                          isMe
                            ? 'bg-[#DCF8C6] rounded-lg rounded-tr-none'
                            : 'bg-white rounded-lg rounded-tl-none'
                        }`}>
                          {!isMe && (
                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white" />
                          )}
                          {isMe && (
                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-[#DCF8C6]" />
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => msg.voiceUrl && toggleVoicePlayback(msg.id, msg.voiceUrl)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                                isMe ? 'bg-[#25D366] text-white' : 'bg-[#075E54] text-white'
                              }`}
                            >
                              <span className={`material-symbols-outlined text-xl ${isPlaying ? 'filled' : ''}`}>
                                {isPlaying ? 'pause' : 'play_arrow'}
                              </span>
                            </button>

                            <div
                              className="flex-1 flex items-center gap-[2px] h-8 px-1 cursor-pointer rounded overflow-hidden relative"
                              onClick={(e) => {
                                if (!msg.voiceUrl) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                seekVoice(msg.id, msg.voiceUrl, fraction);
                              }}
                            >
                              {isPlaying && (
                                <div className="absolute top-0 left-0 h-full rounded z-0 bg-black/5" style={{ width: `${currentProgress * 100}%`, transition: 'width 0.1s linear' }} />
                              )}
                              <div className="relative z-[1] flex items-center gap-[2px] h-full">
                                {getWaveformBars(msg.id, isMe, isPlaying)}
                              </div>
                            </div>

                            <span className="text-[10px] text-gray-500 shrink-0 font-mono min-w-[32px] text-right">
                              {isPlaying && audioRef.current?.duration
                                ? (() => { const c = Math.floor(audioRef.current.currentTime); return `${Math.floor(c / 60)}:${(c % 60).toString().padStart(2, '0')}`; })()
                                : msg.voiceDuration ? `${Math.floor(msg.voiceDuration / 60)}:${(msg.voiceDuration % 60).toString().padStart(2, '0')}` : '0:00'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-[#25D366]">chat</span>
            </div>
            <p className="text-base font-medium text-[#075E54]">ابدأ المحادثة</p>
            <p className="text-xs text-gray-500 mt-1">الرسائل مشفرة من الطرف للطرف</p>
          </div>
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-end mb-1">
            <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#075E54] rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#075E54] rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#075E54] rounded-full opacity.80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Voice upload progress */}
        {uploadProgress && (
          <div className="flex justify-end mb-1">
            <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-2.5 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#075E54] text-lg animate-spin">progress_activity</span>
              <span className="text-sm text-[#075E54]">بيرفع الصوت...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Recording bar */}
      {recording && (
        <div className={`flex items-center gap-3 px-4 py-3 bg-white border-t ${isNearLimit ? 'border-red-400' : 'border-gray-200'}`}>
          <div className={`h-3 w-3 rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-red-400'} animate-pulse`} />
          <span className={`text-sm font-bold ${isNearLimit ? 'text-red-600' : 'text-[#075E54]'}`}>
            {formatRecordingTime(recordingDuration)}
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : 'bg-[#25D366]'}`} style={{ width: `${recordingProgress}%` }} />
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">
            {isNearLimit ? `متبقي ${MAX_RECORDING_SECONDS - recordingDuration}ث` : 'جاري التسجيل'}
          </span>
          <button onClick={stopRecording} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-lg">stop</span>
            <span>إيقاف</span>
          </button>
        </div>
      )}

      {/* WhatsApp-style Input Area */}
      <div className="bg-[#F0F0F0] px-2 py-2 border-t border-gray-300">
        <div className="flex items-end gap-1.5 max-w-4xl mx-auto">
          {/* Emoji Button */}
          <button className="p-2.5 text-gray-500 hover:text-gray-700 transition-colors mb-0.5">
            <span className="material-symbols-outlined text-[24px]">mood</span>
          </button>

          {/* Text Input */}
          <div className="flex-1 bg-white rounded-[24px] flex items-end shadow-sm border border-gray-200 focus-within:border-[#25D366] focus-within:ring-1 focus-within:ring-[#25D366]/30 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[14.5px] text-[#111B21] placeholder:text-gray-400 px-3 py-2.5 max-h-[120px]"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              disabled={recording || isBlocked}
              placeholder={roomInfo?.isClosed ? 'المحادثة مقفلة...' : patientBlocked ? 'مش قادر تبعت دلوقتي...' : 'اكتب رسالة'}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-0.5 mb-0.5">
            {!recording && !text.trim() ? (
              <button
                onClick={isBlocked ? undefined : startRecording}
                disabled={isBlocked}
                className={`p-2.5 rounded-full transition-all active:scale-90 ${
                  isBlocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#075E54] text-white hover:bg-[#064E46] shadow-md'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">mic</span>
              </button>
            ) : recording ? (
              <button
                onClick={stopRecording}
                className="p-2.5 rounded-full bg-red-500 text-white transition-all active:scale-90 shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">mic_off</span>
              </button>
            ) : (
              <button
                onClick={sendText}
                disabled={!text.trim() || sending || isBlocked}
                className="p-2.5 rounded-full bg-[#075E54] text-white hover:bg-[#064E46] shadow-md transition-all active:scale-90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[24px] rotate-180 filled">send</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* E2E Encryption Notice */}
      <div className="bg-[#F0F0F0] px-4 py-1.5 text-center border-t border-gray-300">
        <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>
          الرسائل مشفرة من الطرف للطرف
        </p>
      </div>
    </div>
  );
}
