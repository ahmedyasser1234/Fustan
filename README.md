# 🛍️ Modern Multi-Vendor Marketplace (Fustan)

منصة تجارة إلكترونية متكاملة لبيع فساتين العرائس والمناسبات، مبنية بأحدث التقنيات لضمان تجربة مستخدم سلسة وأداء فائق.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

---

## 📋 جدول المحتويات
- [🚀 البدء السريع](#-البدء-السريع)
- [🔑 إعداد البيئة (ENV)](#-إعداد-البيئة-env)
- [✨ الميزات الرئيسية](#-الميزات-الرئيسية)
- [🏗️ هيكل المشروع](#-هيكل-المشروع)
- [🤖 ميزات الذكاء الاصطناعي](#-ميزات-الذكاء-الاصطناعي)
- [🛠️ التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [📦 الأوامر المهمة](#-الأوامر-المهمة)

---

## 🚀 البدء السريع

### 1. تثبيت المتطلبات
تأكد من تثبيت **Node.js 18+** و **pnpm 10+**.

```bash
# تثبيت المكتبات
pnpm install
```

### 2. إعداد قاعدة البيانات
المشروع يستخدم PostgreSQL (عبر Drizzle ORM).
```bash
# تطبيق الترحيلات على قاعدة البيانات
pnpm db:push
```

### 3. تشغيل المشروع
```bash
# تشغيل خادم التطوير (Frontend & Backend)
pnpm dev
```
الموقع سيكون متاحاً على: `http://localhost:3000`

---

## 🔑 إعداد البيئة (ENV)

يجب إنشاء ملف `.env` في مجلد `server-nestjs` بالقيم التالية:

```env
# قاعدة البيانات
DATABASE_URL=postgres://user:password@localhost:5432/fustan_db

# المصادقة والأمان
JWT_SECRET=your_super_secret_key
VITE_APP_ID=fustan-app

# خدمات الذكاء الاصطناعي (AI)
GEMINI_API_KEY=your_gemini_key
KIE_AI_API_KEY=your_kie_ai_key
OPENAI_API_KEY=your_openai_key

# تخزين الصور (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## ✨ الميزات الرئيسية

### 🛒 للعملاء
- ✅ تصفح فساتين من بائعين مختلفين مع فلترة ذكية.
- ✅ سلة تسوق ديناميكية وتتبع طلبات حي.
- ✅ **Virtual Try-On**: تجربة الفساتين افتراضياً باستخدام الذكاء الاصطناعي.

### 🏪 للبائعين
- ✅ لوحة تحكم شاملة لإدارة المنتجات، الطلبات، والخصومات.
- ✅ تحليلات ذكية للمبيعات مدعومة بـ AI.
- ✅ نظام إدارة الكوبونات والعروض الخاصة.

### 👨‍💼 للمشرفين
- ✅ لوحة تحكم لإدارة البائعين، المنتجات، والنزاعات.
- ✅ تقارير مالية وإدارة العمولات.

---

## 🏗️ هيكل المشروع

```text
Fustan-main/
├── client/             # الواجهة الأمامية (React + Vite)
│   ├── src/pages/      # الصفحات (Home, Products, Dashboards...)
│   └── src/components/ # المكونات القابلة لإعادة الاستخدام
├── server-nestjs/      # الخادم الخلفي (NestJS)
│   ├── src/ai/         # خدمات الذكاء الاصطناعي
│   ├── src/database/   # تعريف الجداول والاتصال (Drizzle)
│   └── src/auth/       # نظام المصادقة والأمان
└── shared/             # كود مشترك (Types & Constants)
```

---

## 🤖 ميزات الذكاء الاصطناعي

يوفر المشروع ميزات متقدمة باستخدام AI:
1. **Virtual Try-On**: توليد صور للمستخدم وهو يرتدي الفستان المختار.
2. **AI Descriptions**: كتابة أوصاف تسويقية للمنتجات باللغتين العربية والإنجليزية.
3. **Smart Analytics**: تحليل بيانات المبيعات وتقديم توصيات استراتيجية للبائعين.

---

## 🛠️ التقنيات المستخدمة

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, TanStack Query.
- **Backend**: NestJS 11, Drizzle ORM, PostgreSQL.
- **AI Integrations**: Google Gemini, Kie.ai, OpenAI.
- **Tools**: pnpm, Vite, Vitest.

---

## 📦 الأوامر المهمة

| الأمر | الوصف |
|-------|--------|
| `pnpm dev` | تشغيل التطبيق في وضع التطوير |
| `pnpm build` | بناء نسخة الإنتاج |
| `pnpm test` | تشغيل الاختبارات |
| `pnpm db:push` | تحديث هيكل قاعدة البيانات |
| `pnpm format` | تنسيق الكود تلقائياً |

---

**آخر تحديث**: أبريل 2026
**الحالة**: 🟢 نشط وجاهز للاستخدام
 صُنع بـ ❤️ لقطاع الأزياء الراقية.
