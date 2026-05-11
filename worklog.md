---
Task ID: 1
Agent: Main Agent
Task: مراجعة شاملة واصلاح الأخطاء والثغرات الأمنية لمنصة وصال

Work Log:
- استنساخ المشروع من GitHub (mohannadcontento-sketch/wesal-)
- مراجعة شاملة لجميع الملفات (API Routes, Components, Pages, Prisma Schema)
- اكتشاف وإصلاح أخطاء متعددة
- بناء نظام الإعدادات من الصفر
- إضافة ميزات أمان وحماية

Stage Summary:
- تم إصلاح bug حرج: user.realName في إنشاء الإشعارات → user.profile?.realName
- تم بناء نظام إعدادات كامل: SiteSetting model + API + settings library + admin page
- تم تطبيق الإعدادات على: التسجيل، النشر، التعليقات
- تم إزالة X-Email-Method header الأمني
- تم إضافة إشعارات عند: حل البلاغ، تغيير حالة الموعد، حجز موعد جديد
- تم إضافة API لحذف الإشعارات
- تم إضافة زر بلاغ في PostCard مع نافذة اختيار السبب
- تم إصلاح جميع روابط /community الخاطئة
- تم إصلاح القيمة الثابتة لنقاط السمعة في SideNav
- تم إضافة حماية من وضع الصيانة في middleware
- البناء ينجح بدون أخطاء

---
Task ID: 1
Agent: Admin Users Dashboard Agent
Task: إنشاء لوحة إدارة المستخدمين و API الداعمة

Work Log:
- إنشاء API `/api/admin/users` لجلب المستخدمين مع البحث والتصفية والترقيم
- إنشاء صفحة إدارة المستخدمين `/admin/users` مع جدول تفاعلي وبطاقات للجوال
- تحديث تنقل لوحة الإدارة (navItems) مع إضافة رابط "إدارة المستخدمين"
- تحديث لوحة الإدارة الرئيسية مع بطاقة وصول سريع للمستخدمين
- بناء نافذة تفاصيل المستخدم (Modal) مع إحصائيات وإجراءات
- دعم RTL كامل وتصميم Glass Morphism متسق

Stage Summary:
- تم إنشاء `/src/app/api/admin/users/route.ts` - API مع بحث، تصفية بالدور، ترقيم، وإحصائيات
- تم إنشاء `/src/app/admin/users/page.tsx` - صفحة كاملة مع جدول سطح المكتب وبطاقات الجوال
- تم تحديث `/src/app/admin/layout.tsx` - تغيير روابط التنقل الجانبي
- تم تحديث `/src/app/admin/page.tsx` - إضافة بطاقات وصول سريع
- البناء ينجح بدون أخطاء
- تم الرفع إلى GitHub بنجاح
