'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ApplySupporterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [certificates, setCertificates] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ isSupporter: boolean; status: string | null; canApply: boolean; reputationScore: number; reputationRequired: number } | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/supporters/apply').then(r => r.json()).then(setStatus).catch(() => {});
    }
  }, [user]);

  const addCertificate = () => {
    if (certificates.length < 10) setCertificates([...certificates, '']);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, value: string) => {
    const updated = [...certificates];
    updated[index] = value;
    setCertificates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('سجل دخول الأول'); router.push('/login'); return; }
    if (bio.trim().length < 50) { toast.error('اكتب نبذة عنك (50 حرف على الأقل)'); return; }

    const validCerts = certificates.filter(c => c.trim().length > 0);

    if (validCerts.length === 0 && (status?.reputationScore || 0) < 200) {
      toast.error('لازم تدخل شهادة واحدة على الأقل أو عندك 200 نقطة سمعة');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/supporters/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: bio.trim(),
          specialty: specialty || 'دعم نفسي',
          experience: experience.trim(),
          certificates: validCerts,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setStatus({ isSupporter: true, status: 'pending', canApply: false, reputationScore: status?.reputationScore || 0, reputationRequired: status?.reputationRequired || 200 });
      } else {
        toast.error(data.error || 'حصل خطأ');
      }
    } catch { toast.error('حصل خطأ'); }
    finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Link href="/supporters" className="inline-flex items-center justify-center rounded-full hover:bg-surface-container p-2 mb-6 transition-colors text-primary">
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </Link>

        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
          {/* Header gradient */}
          <div className="bg-gradient-to-l from-primary via-wesal-medium to-wesal-sky p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-on-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-2xl">volunteer_activism</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-on-primary">انضم كداعم</h1>
                <p className="text-xs text-on-primary/80 mt-0.5">قدم دعمك النفسي لمجتمع وصال</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Status check */}
            {status && status.isSupporter && status.status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-xl">hourglass_top</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">طلبك قيد المراجعة</p>
                  <p className="text-xs text-amber-700 mt-1">هنراجع طلبك وهنرد عليك في أقرب وقت</p>
                </div>
              </div>
            )}

            {status && status.isSupporter && status.status === 'approved' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-emerald-800">أنت داعم معتمد!</p>
                  <p className="text-xs text-amber-700 mt-1">شكراً لمساهمتك في دعم المجتمع</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-primary-container/40 border border-primary-container rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                المتطلبات
              </h3>
              <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: 14 }}>check</span>
                  خريج آداب علم نفس أو حاصل على كورسات/شهادات معتمدة في المجال
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: 14 }}>check</span>
                  أو الوصول لمستوى 200 نقطة سمعة في نظام السمعة
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: 14 }}>check</span>
                  الداعم يقدم دعم واستماع فقط — لا تشخيص ولا علاج
                </li>
              </ul>
              {status && (
                <div className="mt-3 pt-3 border-t border-primary-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-on-surface">نقاط السمعة الحالية</span>
                    <span className={`text-sm font-bold ${status.reputationScore >= 200 ? 'text-emerald-600' : 'text-on-surface'}`}>
                      {status.reputationScore} / {status.reputationRequired}
                    </span>
                  </div>
                  <div className="h-2 mt-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${status.reputationScore >= 200 ? 'bg-emerald-500' : 'bg-gradient-to-l from-primary to-wesal-sky'}`}
                      style={{ width: `${Math.min(100, (status.reputationScore / status.reputationRequired) * 100)}%` }}
                    />
                  </div>
                  {status.reputationScore >= 200 && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">أنت مؤهل بالسمعة!</p>
                  )}
                </div>
              )}
            </div>

            {/* Form */}
            {(!status || status.canApply) && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface flex items-center justify-between">
                    <span>نبذة عنك</span>
                    <span className="text-on-surface-variant font-normal text-xs">{bio.length}/500</span>
                  </label>
                  <textarea
                    placeholder="اكتب نبذة عنك وخبراتك ومجالات اللي بتقدم فيها دعم..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    maxLength={500}
                    className="w-full min-h-[120px] bg-surface-container-low border border-outline-variant rounded-xl text-base p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">التخصص</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-base text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="دعم نفسي">دعم نفسي</option>
                    <option value="دعم أسري">دعم أسري</option>
                    <option value="دعم أكاديمي">دعم أكاديمي</option>
                    <option value="دعم اجتماعي">دعم اجتماعي</option>
                    <option value="دعم لضحايا العنف">دعم لضحايا العنف</option>
                    <option value="دعم الإدمان">دعم الإدمان</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">الخبرة (اختياري)</label>
                  <textarea
                    placeholder="اوصف خبراتك في مجال الدعم النفسي..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    maxLength={300}
                    className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant rounded-xl text-base p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                  />
                </div>

                {/* Certificates */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-on-surface">الشهادات والكورسات</label>
                    {certificates.length < 10 && (
                      <button type="button" onClick={addCertificate} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                        إضافة
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {certificates.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => updateCertificate(i, e.target.value)}
                          placeholder={`شهادة ${i + 1}`}
                          className="flex-1 h-11 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        {certificates.length > 1 && (
                          <button type="button" onClick={() => removeCertificate(i)} className="p-2 text-error hover:bg-error-container rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || bio.trim().length < 50}
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-primary to-wesal-sky text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      جاري التقديم...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      تقديم الطلب
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
