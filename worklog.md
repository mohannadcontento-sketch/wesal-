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
