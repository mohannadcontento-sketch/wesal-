'use client';

import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ApplySupporterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [certificateNames, setCertificateNames] = useState<string[]>(['']);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [certificateFilePreviews, setCertificateFilePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ isSupporter: boolean; status: string | null; canApply: boolean; reputationScore: number; reputationRequired: number; eligibleForSupporter: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/supporters/apply').then(r => r.json()).then(setStatus).catch(() => {});
    }
  }, [user]);

  const addCertificate = () => {
    if (certificateNames.length < 10) setCertificateNames([...certificateNames, '']);
  };

  const removeCertificate = (index: number) => {
    setCertificateNames(certificateNames.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, value: string) => {
    const updated = [...certificateNames];
    updated[index] = value;
    setCertificateNames(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    // Validate each file
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`حجم ملف ${file.name} أكبر من 5 ميجا`);
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`نوع ملف ${file.name} غير مدعوم. استخدم صور أو PDF`);
        return;
      }
    }

    const allFiles = [...certificateFiles, ...newFiles].slice(0, 5); // Max 5 files
    setCertificateFiles(allFiles);

    // Generate previews
    const newPreviews: string[] = [];
    for (const file of allFiles) {
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        newPreviews.push('pdf');
      }
    }
    setCertificateFilePreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = certificateFiles.filter((_, i) => i !== index);
    const newPreviews = certificateFilePreviews.filter((_, i) => i !== index);
    setCertificateFiles(newFiles);
    setCertificateFilePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('سجل دخول الأول'); router.push('/login'); return; }
    if (bio.trim().length < 50) { toast.error('اكتب نبذة عنك (50 حرف على الأقل)'); return; }

    const validCerts = certificateNames.filter(c => c.trim().length > 0);

    if (validCerts.length === 0 && certificateFiles.length === 0 && (status?.reputationScore || 0) < 200) {
      toast.error('لازم تدخل شهادة واحدة على الأقل أو ترفع صور الشهادات أو عندك 200 نقطة سمعة');
      return;
    }

    setLoading(true);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('bio', bio.trim());
      formData.append('specialty', specialty || 'دعم نفسي');
      formData.append('experience', experience.trim());
      formData.append('certificateNames', JSON.stringify(validCerts));

      // Append certificate files
      certificateFiles.forEach((file) => {
        formData.append('certificateFiles', file);
      });

      const res = await fetch('/api/supporters/apply', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setStatus({ isSupporter: true, status: 'pending', canApply: false, reputationScore: status?.reputationScore || 0, reputationRequired: status?.reputationRequired || 200, eligibleForSupporter: false });
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
                  <p className="text-xs text-amber-700 mt-1">هنراجع طلبك وشهاداتك وهنرد عليك في أقرب وقت</p>
                </div>
              </div>
            )}

            {status && status.isSupporter && status.status === 'approved' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-emerald-800">أنت داعم معتمد!</p>
                  <p className="text-xs text-emerald-700 mt-1">شكراً لمساهمتك في دعم المجتمع</p>
                </div>
              </div>
            )}

            {/* Eligible via reputation banner */}
            {status && status.eligibleForSupporter && (
              <div className="bg-primary-container/40 border border-primary-container rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl">stars</span>
                <div>
                  <p className="text-sm font-bold text-primary">أنت مؤهل بالسمعة!</p>
                  <p className="text-xs text-on-surface-variant mt-1">بما إنك وصلت لـ {status.reputationScore} نقطة سمعة، تقدر تقدم كداعم مباشرة</p>
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
                  ارفع صور شهاداتك أو كورساتك (صور أو PDF)
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

                {/* Certificate Names */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-on-surface">الشهادات والكورسات (أسماء)</label>
                    {certificateNames.length < 10 && (
                      <button type="button" onClick={addCertificate} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                        إضافة
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {certificateNames.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => updateCertificate(i, e.target.value)}
                          placeholder={`شهادة ${i + 1}`}
                          className="flex-1 h-11 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        {certificateNames.length > 1 && (
                          <button type="button" onClick={() => removeCertificate(i)} className="p-2 text-error hover:bg-error-container rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-lg">upload_file</span>
                    رفع صور الشهادات (اختياري)
                  </label>
                  <p className="text-xs text-on-surface-variant">ارفع صور شهاداتك أو كورساتك (صور JPG/PNG أو PDF، حد أقصى 5 ملفات، 5 ميجا لكل ملف)</p>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary-container/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mx-auto block mb-2">cloud_upload</span>
                    <p className="text-sm font-medium text-on-surface-variant">اضغط لرفع الملفات</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">أو اسحب الملفات هنا</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* File previews */}
                  {certificateFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {certificateFiles.map((file, i) => (
                        <div key={i} className="relative group border border-outline-variant rounded-xl overflow-hidden">
                          {certificateFilePreviews[i] === 'pdf' ? (
                            <div className="h-24 flex items-center justify-center bg-surface-container">
                              <span className="material-symbols-outlined text-3xl text-error">picture_as_pdf</span>
                            </div>
                          ) : (
                            <img src={certificateFilePreviews[i]} alt={`شهادة ${i + 1}`} className="h-24 w-full object-cover" />
                          )}
                          <div className="p-2">
                            <p className="text-xs text-on-surface-variant truncate">{file.name}</p>
                            <p className="text-[10px] text-on-surface-variant/60">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute top-1 left-1 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Important notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">warning</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    الأدمن هيراجع شهاداتك وبياناتك قبل ما يتم قبولك. لو الشهادات مش واضحة أو مش حقيقية، الطلب هيتم رفضه.
                  </p>
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
