'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface SenderInfo { name: string; avatarUrl?: string | null }
interface Message {
  id: string; senderId: string; messageType: string; content?: string;
  voiceUrl?: string; voiceDuration?: number; createdAt: string; sender?: SenderInfo;
}
interface AppointmentInfo { id: string; appointmentDate: string; status: string; reason: string }
interface RoomInfo {
  id: string; status: string; patientId: string; doctorId: string;
  patientName: string; patientAvatar?: string | null; doctorName: string;
  doctorAvatar?: string | null; appointment: AppointmentInfo | null;
  patientCanSend: boolean; sessionMessage: string; isPatient: boolean;
  isAdmin?: boolean; isClosed?: boolean;
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
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
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherPerson = (() => {
    if (!roomInfo || !user) return { name: 'الدكتور', avatarUrl: null };
    if (user.role === 'admin') {
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
      if (res.ok) { setMessages(data.messages || []); if (data.room) setRoomInfo(data.room); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 5000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [roomId, fetchMessages]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop(); mediaRecorderRef.current = null;
      }
    };
  }, []);

  const patientBlocked = !roomInfo?.patientCanSend;

  const handleRoomAction = async (action: 'close' | 'open' | 'delete') => {
    setShowMenu(false);
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/chat/rooms/${roomId}`, { method: 'DELETE' });
        if (res.ok) { toast.success('تم حذف المحادثة'); window.location.href = '/chat'; }
        else toast.error('مش قادر يحذف');
      } else {
        const res = await fetch(`/api/chat/rooms/${roomId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action === 'close' ? 'closed' : 'open' }) });
        if (res.ok) { toast.success(action === 'close' ? 'تم إغلاق المحادثة' : 'تم فتح المحادثة'); fetchMessages(); }
        else toast.error('حصل خطأ');
      }
    } catch { toast.error('حصل خطأ'); }
  };

  const deleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId }) });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success('تم حذف الرسالة');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'مش قادر يحذف الرسالة');
      }
    } catch { toast.error('حصل خطأ'); }
    finally { setDeletingMessage(null); setSelectedMessage(null); }
  };

  const handleLongPressStart = (msg: Message) => {
    longPressTimerRef.current = setTimeout(() => {
      setSelectedMessage(msg);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const sendText = async () => {
    if (!text.trim() || sending || patientBlocked) return;
    setSending(true);
    const optimisticMsg: Message = { id: `temp-${Date.now()}`, senderId: user?.userId || '', messageType: 'text', content: text, createdAt: new Date().toISOString(), sender: { name: user?.realName || 'أنت', avatarUrl: user?.avatarUrl || null } };
    setMessages(prev => [...prev, optimisticMsg]);
    const sentText = text; setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: sentText }) });
      if (res.ok) { const data = await res.json(); setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m)); }
      else { setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)); setText(sentText); toast.error('مش قادر ترسل الرسالة'); }
    } catch { setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)); setText(sentText); toast.error('حصل خطأ'); }
    finally { setSending(false); textareaRef.current?.focus(); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
        if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
        const dur = Math.round((Date.now() - recordStartTimeRef.current) / 1000);
        if (dur < 1 || chunks.length === 0) { stream.getTracks().forEach(t => t.stop()); toast.error('التسجيل قصير أوي'); return; }
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          setUploadProgress(true);
          try {
            const res = await fetch(`/api/chat/${roomId}/voice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voiceData: reader.result, duration: dur }) });
            if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data.message]); toast.success('تم إرسال الرسالة الصوتية'); }
            else { const e = await res.json().catch(() => ({})); toast.error(e.error || 'مش قادر ترسل الصوت'); }
          } catch { toast.error('حصل خطأ'); }
          finally { setUploadProgress(false); }
        };
        reader.readAsDataURL(blob); stream.getTracks().forEach(t => t.stop());
      };
      recorder.onerror = () => { toast.error('حصل خطأ'); stream.getTracks().forEach(t => t.stop()); setRecording(false); if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
      recorder.start(250); setRecording(true); mediaRecorderRef.current = recorder; setRecordingDuration(0); recordStartTimeRef.current = Date.now();
      recordTimerRef.current = setInterval(() => {
        const el = Math.round((Date.now() - recordStartTimeRef.current) / 1000); setRecordingDuration(el);
        if (el === 270) toast.warning('30 ثانية وبيخلص الوقت');
        if (el === 290) toast.warning('10 ثواني وبيخلص الوقت');
      }, 1000);
      autoStopTimerRef.current = setTimeout(() => { if (mediaRecorderRef.current?.state !== 'inactive') { toast('وصلت للحد - 5 دقائق'); mediaRecorderRef.current.stop(); setRecording(false); } }, MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      toast.error(err instanceof DOMException && err.name === 'NotAllowedError' ? 'سمح بالوصول للميكروفون' : 'مش قادر أصل للميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current.stop();
    setRecording(false);
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
  };

  const toggleVoicePlayback = (msgId: string, voiceUrl: string) => {
    if (playingVoiceId === msgId) { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; } if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current); setPlayingVoiceId(null); setPlaybackProgress(0); return; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    try {
      const audio = new Audio(voiceUrl);
      audio.onended = () => { setPlayingVoiceId(null); setPlaybackProgress(0); if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current); };
      audio.onerror = () => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); setPlaybackProgress(0); };
      const up = () => { if (audio.duration) setPlaybackProgress(audio.currentTime / audio.duration); if (playingVoiceId === msgId) progressAnimRef.current = requestAnimationFrame(up); };
      audio.play().then(() => { setPlayingVoiceId(msgId); setPlaybackProgress(0); progressAnimRef.current = requestAnimationFrame(up); }).catch(() => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); });
      audioRef.current = audio;
    } catch { toast.error('مش قادر يشغل الصوت'); }
  };

  const seekVoice = (msgId: string, voiceUrl: string, fraction: number) => {
    if (playingVoiceId === msgId && audioRef.current?.duration) { audioRef.current.currentTime = fraction * audioRef.current.duration; return; }
    try {
      const audio = new Audio(voiceUrl);
      audio.onended = () => { setPlayingVoiceId(null); setPlaybackProgress(0); if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current); };
      audio.onerror = () => { toast.error('مش قادر يشغل الصوت'); setPlayingVoiceId(null); };
      const up = () => { if (audio.duration) setPlaybackProgress(audio.currentTime / audio.duration); if (playingVoiceId === msgId) progressAnimRef.current = requestAnimationFrame(up); };
      audio.play().then(() => { audio.currentTime = fraction * audio.duration; setPlayingVoiceId(msgId); setPlaybackProgress(fraction); progressAnimRef.current = requestAnimationFrame(up); }).catch(() => toast.error('مش قادر يشغل الصوت'));
      audioRef.current = audio;
    } catch { toast.error('مش قادر يشغل الصوت'); }
  };

  const formatSessionMessage = (msg: string) => {
    if (msg.startsWith('appointment_time:')) {
      const d = new Date(msg.replace('appointment_time:', ''));
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

  const formatRecordingTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } };
  const handleTextareaInput = () => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } };

  const getWaveformBars = (id: string, isSent: boolean, isPlaying: boolean) => {
    const bars: React.ReactNode[] = [];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
    for (let i = 0; i < 28; i++) {
      const h = ((seed * (i + 1) * 7) % 100) / 100;
      bars.push(<div key={i} className={`w-[2px] rounded-full transition-all duration-200 ${isSent ? (isPlaying ? 'bg-on-primary' : 'bg-on-primary/40') : (isPlaying ? 'bg-primary' : 'bg-on-surface-variant/30')}`} style={{ height: `${Math.max(12, h * 100)}%` }} />);
    }
    return bars;
  };

  const recordingProgress = Math.min((recordingDuration / MAX_RECORDING_SECONDS) * 100, 100);
  const isNearLimit = recordingDuration >= MAX_RECORDING_SECONDS - 30;

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const d = new Date(msg.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (d !== currentDate) { currentDate = d; groups.push({ date: d, messages: [] }); }
      groups[groups.length - 1].messages.push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-wesal-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-on-surface-variant">جاري تحميل المحادثة...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-wesal-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-primary">lock</span>
          <p className="text-sm text-on-surface-variant">سجل دخول الأول</p>
          <Link href="/login" className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold">سجل دخول</Link>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const isSentByMe = (senderId: string) => senderId === user?.userId;
  const isBlocked = patientBlocked || roomInfo?.isClosed;

  return (
    <div className="flex flex-col h-[100dvh] bg-wesal-cream">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-on-primary pt-safe-top shadow-lg shadow-primary/10">
        <div className="flex items-center justify-between px-2 sm:px-3 h-14">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/chat" className="p-1.5 hover:bg-on-primary/10 rounded-full transition-colors active:scale-90 shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="relative shrink-0">
              <UserAvatar avatarUrl={otherPerson.avatarUrl} username={otherPerson.name} size="md" className="!w-9 !h-9 sm:!w-10 sm:!h-10 ring-2 ring-on-primary/20" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-wesal-sky border-2 border-primary rounded-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm sm:text-[15px] font-bold leading-tight truncate">{otherPerson.name}</h2>
              {roomInfo?.appointment && roomInfo?.isPatient ? (
                <span className={`text-[10px] sm:text-[11px] truncate ${roomInfo.patientCanSend ? 'text-primary-container' : 'text-amber-300'}`}>
                  {formatSessionMessage(roomInfo.sessionMessage)}
                </span>
              ) : !roomInfo?.isPatient ? (
                <span className="text-[10px] sm:text-[11px] text-primary-container">متصل</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {roomInfo?.appointment && roomInfo?.isPatient && (
              <Link href={`/book/${roomInfo.doctorId}`} className="p-2 hover:bg-on-primary/10 rounded-full transition-colors active:scale-90" title="حجز موعد">
                <span className="material-symbols-outlined text-xl sm:text-[22px]">event_available</span>
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-on-primary/10 rounded-full transition-colors active:scale-90">
                <span className="material-symbols-outlined text-xl sm:text-[22px]">more_vert</span>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 bg-surface-bright text-on-surface rounded-xl shadow-xl py-1 min-w-[170px] border border-surface-container">
                    {roomInfo?.isClosed ? (
                      <button onClick={() => handleRoomAction('open')} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-wesal-sky">lock_open</span>فتح المحادثة
                      </button>
                    ) : (
                      <button onClick={() => handleRoomAction('close')} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-amber-500">lock</span>إغلاق المحادثة
                      </button>
                    )}
                    <div className="border-t border-surface-container my-1" />
                    <button onClick={() => handleRoomAction('delete')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-error hover:bg-error-container transition-colors">
                      <span className="material-symbols-outlined">delete</span>حذف المحادثة
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
        <div className="bg-amber-50 px-4 py-2 text-center border-b border-amber-200">
          <span className="text-xs text-amber-700 font-medium">{formatSessionMessage(roomInfo.sessionMessage)}</span>
        </div>
      )}
      {roomInfo?.isClosed && (
        <div className="bg-error-container px-4 py-2 text-center border-b border-error/20 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-error text-sm">lock</span>
          <span className="text-xs text-on-error-container font-medium">المحادثة مقفلة</span>
        </div>
      )}

      {/* Chat Messages Area */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-2 sm:px-3 py-2" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23004346\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}>

        {messageGroups.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-2">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-[10px] sm:text-[11px] text-on-surface-variant px-3 py-1 rounded-lg shadow-sm font-medium">
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
              const msgIndex = messages.findIndex(m => m.id === msg.id);
              const prevMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isDeleting = deletingMessage === msg.id;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-1 group/msg`}>
                  <div className={`flex items-end gap-1 sm:gap-1.5 max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>

                    {!isMe && (
                      <div className={`w-7 sm:w-8 shrink-0 ${showAvatar ? 'mb-6' : 'invisible'}`}>
                        <UserAvatar avatarUrl={senderAvatar} username={senderName} size="sm" className="!w-6 !h-6 sm:!w-7 sm:!h-7" />
                      </div>
                    )}

                    <div className={`relative ${isMe ? 'order-1' : ''} transition-transform duration-150 active:scale-[0.98]`}
                      onTouchStart={(msg.messageType !== 'text' || isTemp) ? undefined : () => handleLongPressStart(msg)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchMove={handleLongPressEnd}
                      onMouseDown={(msg.messageType !== 'text' || isTemp) ? undefined : () => handleLongPressStart(msg)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                    >
                      {msg.messageType === 'text' && (
                        <div className={`relative shadow-sm ${
                          isMe
                            ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm'
                            : 'bg-surface-bright text-on-surface rounded-2xl rounded-tl-sm border border-surface-container/50'
                        }`}>
                          {!isMe && showAvatar && (
                            <p className="text-[10px] sm:text-[11px] font-semibold text-wesal-sky px-3 pt-2 pb-0.5">{senderName}</p>
                          )}

                          {/* Message text + time inline */}
                          <div className={`px-3 py-2 ${!isMe && showAvatar ? 'pt-0.5' : ''}`}>
                            <p className="text-[14px] sm:text-[15px] leading-[1.75] sm:leading-[1.8] whitespace-pre-wrap break-words [overflow-wrap:break-word] [word-break:break-word]">
                              {msg.content}
                            </p>

                            {/* Time + status - bottom right, compact */}
                            <div className="flex items-center justify-end gap-0.5 -mt-0.5">
                              <span className={`text-[10px] sm:text-[10px] leading-none ${isMe ? 'text-on-primary/50' : 'text-on-surface-variant/60'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isMe && (
                                <span className={`material-symbols-outlined ${isTemp ? 'text-on-primary/30' : 'text-on-primary/60'}`} style={{ fontSize: 15 }}>done_all</span>
                              )}
                            </div>
                          </div>

                          {/* Delete indicator on hover / after long press */}
                          {isDeleting && (
                            <div className="absolute inset-0 bg-on-surface/20 rounded-2xl flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface animate-spin text-2xl">progress_activity</span>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.messageType === 'voice' && (
                        <div className={`px-2.5 sm:px-3 pt-1.5 pb-1.5 shadow-sm min-w-[180px] sm:min-w-[240px] ${
                          isMe ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm' : 'bg-surface-bright text-on-surface rounded-2xl rounded-tl-sm'
                        }`}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => msg.voiceUrl && toggleVoicePlayback(msg.id, msg.voiceUrl)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                                isMe ? 'bg-on-primary/20 text-on-primary' : 'bg-primary text-on-primary'
                              }`}
                            >
                              <span className={`material-symbols-outlined text-lg sm:text-xl ${isPlaying ? 'filled' : ''}`}>
                                {isPlaying ? 'pause' : 'play_arrow'}
                              </span>
                            </button>
                            <div className="flex-1 flex items-center gap-[2px] h-7 sm:h-8 px-1 cursor-pointer rounded overflow-hidden relative"
                              onClick={(e) => { if (!msg.voiceUrl) return; const r = e.currentTarget.getBoundingClientRect(); seekVoice(msg.id, msg.voiceUrl, Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}>
                              {isPlaying && <div className="absolute top-0 left-0 h-full rounded z-0 bg-on-primary/10" style={{ width: `${currentProgress * 100}%`, transition: 'width 0.1s linear' }} />}
                              <div className="relative z-[1] flex items-center gap-[2px] h-full">{getWaveformBars(msg.id, isMe, isPlaying)}</div>
                            </div>
                            <span className={`text-[9px] sm:text-[10px] shrink-0 font-mono min-w-[28px] sm:min-w-[32px] text-right ${isMe ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
                              {isPlaying && audioRef.current?.duration ? (() => { const c = Math.floor(audioRef.current.currentTime); return `${Math.floor(c / 60)}:${(c % 60).toString().padStart(2, '0')}`; })()
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
          <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">chat</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-on-surface">ابدأ المحادثة</p>
            <p className="text-xs text-on-surface-variant mt-1">الرسائل مشفرة من الطرف للطرف</p>
          </div>
        )}

        {sending && (
          <div className="flex justify-end mb-1">
            <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-on-primary rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-on-primary rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-on-primary rounded-full opacity-80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {uploadProgress && (
          <div className="flex justify-end mb-1">
            <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3 py-2.5 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-on-primary text-lg animate-spin">progress_activity</span>
              <span className="text-sm">بيرفع الصوت...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Message Action Bottom Sheet */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          <div className="relative z-10 w-full max-w-lg bg-surface-bright rounded-t-2xl shadow-2xl animate-slide-up overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-surface-container-high" />
            </div>

            {/* Message preview */}
            <div className="px-5 py-3 border-b border-surface-container">
              <p className="text-sm text-on-surface-variant font-medium mb-1">رسالة</p>
              <p className="text-sm text-on-surface leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {selectedMessage.messageType === 'voice' ? 'رسالة صوتية' : selectedMessage.content}
              </p>
              <p className="text-[11px] text-on-surface-variant/60 mt-1">{formatTime(selectedMessage.createdAt)}</p>
            </div>

            {/* Actions */}
            <div className="p-2">
              {isSentByMe(selectedMessage.senderId) && (
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  disabled={deletingMessage === selectedMessage.id}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-error hover:bg-error-container rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-xl">delete</span>
                  </div>
                  <div className="text-right">
                    <span>حذف الرسالة</span>
                    {deletingMessage === selectedMessage.id && (
                      <span className="material-symbols-outlined text-error text-lg animate-spin mr-2 align-middle">progress_activity</span>
                    )}
                  </div>
                </button>
              )}
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-xl transition-colors active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
                </div>
                إلغاء
              </button>
            </div>

            {/* Safe area */}
            <div className="pb-safe-bottom" />
          </div>
        </div>
      )}

      {/* Recording bar */}
      {recording && (
        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-bright border-t ${isNearLimit ? 'border-error' : 'border-surface-container'}`}>
          <div className={`h-3 w-3 rounded-full ${isNearLimit ? 'bg-error' : 'bg-error/70'} animate-pulse`} />
          <span className={`text-sm font-bold ${isNearLimit ? 'text-error' : 'text-on-surface'}`}>{formatRecordingTime(recordingDuration)}</span>
          <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-error' : 'bg-wesal-sky'}`} style={{ width: `${recordingProgress}%` }} />
          </div>
          <span className="text-xs text-on-surface-variant hidden sm:block">{isNearLimit ? `متبقي ${MAX_RECORDING_SECONDS - recordingDuration}ث` : 'جاري التسجيل'}</span>
          <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-error text-on-error rounded-full text-sm font-bold hover:bg-error/90 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-lg">stop</span>
            <span className="hidden sm:inline">إيقاف</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-surface-container px-2 sm:px-3 py-2 border-t border-surface-container-high">
        <div className="flex items-end gap-1 sm:gap-1.5 max-w-4xl mx-auto">
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors mb-0.5 active:scale-90">
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">mood</span>
          </button>

          <div className="flex-1 bg-surface-bright rounded-2xl sm:rounded-[24px] flex items-end shadow-sm border border-surface-container focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[14px] sm:text-[14.5px] text-on-surface placeholder:text-on-surface-variant/50 px-3 py-2 sm:py-2.5 max-h-[100px] sm:max-h-[120px]"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              disabled={recording || isBlocked}
              placeholder={roomInfo?.isClosed ? 'المحادثة مقفلة...' : patientBlocked ? 'مش قادر تبعت دلوقتي...' : 'اكتب رسالة'}
            />
          </div>

          <div className="flex gap-0.5 mb-0.5">
            {!recording && !text.trim() ? (
              <button onClick={isBlocked ? undefined : startRecording} disabled={isBlocked}
                className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-90 ${isBlocked ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90 shadow-md'}`}>
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">mic</span>
              </button>
            ) : recording ? (
              <button onClick={stopRecording} className="p-2 sm:p-2.5 rounded-full bg-error text-on-error transition-all active:scale-90 shadow-md">
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">mic_off</span>
              </button>
            ) : (
              <button onClick={sendText} disabled={!text.trim() || sending || isBlocked}
                className="p-2 sm:p-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/90 shadow-md transition-all active:scale-90 disabled:opacity-40">
                <span className="material-symbols-outlined text-[22px] sm:text-[24px] rotate-180 filled">send</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Encryption notice */}
      <div className="bg-surface-container px-4 py-1 text-center border-t border-surface-container-high pb-safe-bottom">
        <p className="text-[9px] sm:text-[10px] text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>lock</span>
          الرسائل مشفرة من الطرف للطرف
        </p>
      </div>
    </div>
  );
}
