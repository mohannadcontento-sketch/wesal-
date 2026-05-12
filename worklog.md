---
Task ID: 1
Agent: Main Agent
Task: فحص الكود الحالي المتعلق بالداعمين في مشروع وصال

Work Log:
- قراءة جميع الملفات المتعلقة بنظام الداعمين
- فهم البنية الحالية: Prisma Schema, API routes, Frontend pages
- تحديد الفجوات في النظام الحالي

Stage Summary:
- النظام الحالي يدعم تسجيل الداعم لكن بدون رفع ملفات شهادات
- دور الداعم عند القبول كان 'trusted' بدلاً من 'supporter'
- لا يوجد نظام ترقية من السمعة
- لا يوجد عرض للمستخدمين المؤهلين بالسمعة في لوحة الأدمن

---
Task ID: 2-3
Agent: Main Agent
Task: تعديل Schema و APIs لدعم نظام الداعمين المحسن

Work Log:
- إضافة حقول certificateFiles, source, reputationOfferedAt لجدول Supporter
- تعديل API /api/supporters/apply لدعم FormData ورفع ملفات الشهادات
- تعديل API /api/admin/supporters/[id] لتحويل الدور لـ 'supporter' بدلاً من 'trusted'
- إنشاء API /api/admin/supporters/eligible لعرض المستخدمين المؤهلين بالسمعة
- إنشاء API /api/admin/users/[id]/promote-supporter لترقية مستخدم لداعم عبر السمعة
- تعديل session.ts لإضافة badge لدور supporter
- تعديل admin stats لإضافة عدد الداعمين والمؤهلين

Stage Summary:
- تم إضافة رفع ملفات الشهادات (صور/PDF) عبر FormData
- تم إضافة نظام الترقية من السمعة (200+ نقطة)
- تم تغيير دور الداعم المعتمد من 'trusted' إلى 'supporter'
- تم إضافة مصدر الطلب (application/reputation) في سجل الداعم

---
Task ID: 4-7
Agent: Main Agent
Task: تعديل صفحات الواجهة لدعم النظام المحسن

Work Log:
- إعادة كتابة صفحة /supporters/apply مع دعم رفع ملفات الشهادات
- إعادة كتابة مكون SupporterApplications مع تبويب المستخدمين المؤهلين
- إضافة إشعار الترقية من السمعة في صفحة البروفايل
- تعديل Navbar لدعم دور supporter

Stage Summary:
- صفحة التقديم كداعم تدعم الآن رفع ملفات الشهادات مع معاينة
- لوحة أدمن الداعمين تعرض طلبات الانضمام + المستخدمين المؤهلين بالسمعة
- بروفايل المستخدم يعرض إشعار التأهل للداعمين عند 200+ نقطة سمعة
