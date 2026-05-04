import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wesal-cream">
      {/* Logo */}
      <div className="h-14 w-40 mb-8 animate-fade-in-up">
        <Image
          src="/logo.png"
          alt="وصال"
          width={196}
          height={67}
          className="object-contain"
          priority
        />
      </div>

      {/* Animated dots */}
      <div className="flex items-center justify-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full bg-wesal-dark animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-wesal-medium animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-wesal-sky animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
        />
      </div>

      <p className="text-sm text-wesal-medium mt-4">جارٍ التحميل...</p>
    </div>
  );
}
