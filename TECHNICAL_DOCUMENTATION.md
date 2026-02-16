# منصة التجارة الإلكترونية متعددة البائعين - الوثائق التقنية الشاملة

## جدول المحتويات
1. [نظرة عامة على المشروع](#نظرة-عامة-على-المشروع)
2. [البنية المعمارية](#البنية-المعمارية)
3. [قاعدة البيانات](#قاعدة-البيانات)
4. [واجهات API](#واجهات-api)
5. [الواجهة الأمامية](#الواجهة-الأمامية)
6. [الميزات الرئيسية](#الميزات-الرئيسية)
7. [التقنيات المستخدمة](#التقنيات-المستخدمة)
8. [التثبيت والإعداد](#التثبيت-والإعداد)
9. [الاختبار والنشر](#الاختبار-والنشر)

---

## نظرة عامة على المشروع

**Modern Multi-Vendor Marketplace** هي منصة تجارة إلكترونية متعددة البائعين توفر:

- **نظام متكامل للبائعين**: لوحة تحكم شاملة لإدارة المتاجر والمنتجات والطلبات
- **تجربة تسوق متقدمة**: واجهة عصرية مع بحث وفلترة متقدمة
- **نظام إدارة قوي**: لوحة تحكم إدارية لإدارة البائعين والمنتجات والطلبات
- **معالجة آمنة للمدفوعات**: تكامل مع Stripe لمعالجة البطاقات الائتمانية
- **نظام إشعارات متقدم**: إشعارات فورية للعملاء والبائعين
- **تخزين سحابي**: دعم Amazon S3 لتخزين الصور والملفات

---

## البنية المعمارية

### الهيكل العام

```
modern-multivendor-shop/
├── client/                    # الواجهة الأمامية (React 19 + Tailwind 4)
│   ├── src/
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── components/       # مكونات قابلة لإعادة الاستخدام
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   ├── lib/              # مكتبات مساعدة
│   │   └── App.tsx           # تطبيق رئيسي
│   └── public/               # ملفات ثابتة
├── server/                    # الخادم الخلفي (Express + tRPC)
│   ├── routers.ts            # إجراءات tRPC
│   ├── db.ts                 # دوال مساعدة قاعدة البيانات
│   └── _core/                # ملفات البنية الأساسية
├── drizzle/                   # إدارة قاعدة البيانات
│   └── schema.ts             # نموذج قاعدة البيانات
├── storage/                   # معالجات التخزين السحابي
└── shared/                    # كود مشترك بين الخادم والعميل
```

### معمارية الطبقات

```
┌─────────────────────────────────────────┐
│     الواجهة الأمامية (React)            │
│  - صفحات المتجر                         │
│  - لوحات التحكم                         │
│  - مكونات واجهة المستخدم               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     طبقة الاتصال (tRPC + HTTP)         │
│  - استدعاءات الإجراءات                  │
│  - معالجة الأخطاء                      │
│  - التحقق من الأنواع                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     طبقة الأعمال (tRPC Routers)        │
│  - منطق الأعمال                        │
│  - التحقق من الصلاحيات                 │
│  - معالجة البيانات                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     طبقة البيانات (Drizzle ORM)        │
│  - استعلامات قاعدة البيانات            │
│  - العلاقات بين الجداول                │
│  - الترحيلات                           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     قاعدة البيانات (MySQL/TiDB)        │
│  - تخزين البيانات                      │
│  - الفهارس والعلاقات                   │
└─────────────────────────────────────────┘
```

---

## قاعدة البيانات

### الجداول الرئيسية

#### 1. جدول المستخدمين (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin', 'vendor') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. جدول البائعين (vendors)
```sql
CREATE TABLE vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  storeName VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  banner VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(320),
  city VARCHAR(100),
  country VARCHAR(100),
  address TEXT,
  website VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0,
  commissionRate DECIMAL(5,2) DEFAULT 10,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 3. جدول المنتجات (products)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendorId INT NOT NULL,
  categoryId INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  originalPrice DECIMAL(10,2),
  stock INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  images JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  reviewCount INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

#### 4. جدول الفئات (categories)
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parentId INT,
  icon VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES categories(id)
);
```

#### 5. جدول الطلبات (orders)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  customerId INT NOT NULL,
  vendorId INT,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'confirmed', 'refunded') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  shippingAddress TEXT,
  billingAddress TEXT,
  totalPrice DECIMAL(10,2),
  shippingCost DECIMAL(10,2),
  taxAmount DECIMAL(10,2),
  notes TEXT,
  trackingNumber VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (vendorId) REFERENCES vendors(id)
);
```

#### 6. جدول عناصر الطلب (orderItems)
```sql
CREATE TABLE orderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  vendorId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (vendorId) REFERENCES vendors(id)
);
```

#### 7. جدول سلة التسوق (cartItems)
```sql
CREATE TABLE cartItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE KEY unique_user_product (userId, productId)
);
```

#### 8. جدول المراجعات (reviews)
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 9. جدول الإشعارات (notifications)
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  actionUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 10. جدول قائمة الرغبات (wishlists)
```sql
CREATE TABLE wishlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  productId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE KEY unique_user_product (userId, productId)
);
```

---

## واجهات API

### إجراءات tRPC الرئيسية

#### 1. إجراءات المصادقة (Auth)
```typescript
// تسجيل الدخول
trpc.auth.me.useQuery()

// تسجيل الخروج
trpc.auth.logout.useMutation()
```

#### 2. إجراءات المنتجات (Products)
```typescript
// الحصول على المنتجات
trpc.products.list.useQuery({ limit, offset, categoryId, search })

// الحصول على منتج واحد
trpc.products.getById.useQuery(productId)

// الحصول على منتجات البائع
trpc.products.getByVendor.useQuery({ vendorId, limit, offset })

// إنشاء منتج
trpc.products.create.useMutation()

// تحديث منتج
trpc.products.update.useMutation()

// حذف منتج
trpc.products.delete.useMutation()

// البحث والفلترة
trpc.products.search.useQuery({ query, filters })
```

#### 3. إجراءات السلة (Cart)
```typescript
// الحصول على عناصر السلة
trpc.cart.getItems.useQuery()

// إضافة منتج للسلة
trpc.cart.addItem.useMutation()

// إزالة منتج من السلة
trpc.cart.removeItem.useMutation()

// تحديث كمية المنتج
trpc.cart.updateQuantity.useMutation()

// مسح السلة
trpc.cart.clear.useMutation()
```

#### 4. إجراءات الطلبات (Orders)
```typescript
// الحصول على الطلبات
trpc.orders.list.useQuery({ limit, offset })

// الحصول على طلب واحد
trpc.orders.getById.useQuery(orderId)

// إنشاء طلب
trpc.orders.create.useMutation()

// تحديث حالة الطلب
trpc.orders.updateStatus.useMutation()

// الحصول على طلبات البائع
trpc.orders.getByVendor.useQuery({ vendorId, limit, offset })
```

#### 5. إجراءات البائع (Vendor)
```typescript
// الحصول على ملف البائع
trpc.vendor.getProfile.useQuery()

// تحديث ملف البائع
trpc.vendor.updateProfile.useMutation()

// الحصول على إحصائيات لوحة التحكم
trpc.vendor.getDashboard.useQuery()

// الحصول على مبيعات البائع
trpc.vendor.getSales.useQuery({ period })
```

#### 6. إجراءات الفئات (Categories)
```typescript
// الحصول على جميع الفئات
trpc.categories.list.useQuery()

// الحصول على فئة واحدة
trpc.categories.getById.useQuery(categoryId)

// الحصول على الفئات الفرعية
trpc.categories.getSubcategories.useQuery(parentId)
```

#### 7. إجراءات المراجعات (Reviews)
```typescript
// الحصول على مراجعات المنتج
trpc.reviews.getByProduct.useQuery(productId)

// إنشاء مراجعة
trpc.reviews.create.useMutation()

// تحديث مراجعة
trpc.reviews.update.useMutation()

// حذف مراجعة
trpc.reviews.delete.useMutation()
```

#### 8. إجراءات الإشعارات (Notifications)
```typescript
// الحصول على الإشعارات
trpc.notifications.list.useQuery()

// تحديد إشعار كمقروء
trpc.notifications.markAsRead.useMutation()

// حذف إشعار
trpc.notifications.delete.useMutation()

// مسح جميع الإشعارات
trpc.notifications.clear.useMutation()
```

---

## الواجهة الأمامية

### الصفحات الرئيسية

| الصفحة | المسار | الوصف |
|-------|--------|-------|
| الرئيسية | `/` | عرض المنتجات المميزة والعروض الخاصة |
| المنتجات | `/products` | قائمة المنتجات مع الفلترة والبحث |
| تفاصيل المنتج | `/products/:id` | تفاصيل المنتج والمراجعات |
| السلة | `/cart` | عرض المنتجات في السلة |
| الدفع | `/checkout` | عملية الدفع متعددة الخطوات |
| الطلبات | `/orders` | عرض طلبات المستخدم |
| الإشعارات | `/notifications` | مركز الإشعارات |
| بروفايل البائع | `/vendor/:id` | عرض متجر البائع |
| لوحة البائع | `/vendor/dashboard` | إدارة متجر البائع |
| لوحة المشرف | `/admin/dashboard` | إدارة النظام |

### المكونات الرئيسية

#### مكونات عامة
- `Button` - زر قابل للتخصيص
- `Card` - بطاقة محتوى
- `Input` - حقل إدخال
- `Select` - قائمة منسدلة
- `Modal` - نافذة منفثقة
- `Toast` - إشعار مؤقت

#### مكونات متخصصة
- `ProductCard` - بطاقة المنتج
- `ProductGrid` - شبكة المنتجات
- `CartSummary` - ملخص السلة
- `OrderStatus` - حالة الطلب
- `VendorInfo` - معلومات البائع
- `DashboardLayout` - تخطيط لوحة التحكم

---

## الميزات الرئيسية

### 1. نظام المصادقة
- تسجيل دخول عبر Manus OAuth
- أدوار مختلفة (عميل، بائع، مشرف)
- جلسات آمنة مع ملفات تعريف الارتباط

### 2. إدارة المنتجات
- إضافة وتعديل وحذف المنتجات
- دعم الصور المتعددة
- إدارة المخزون
- تحديد الأسعار والعروض الخاصة

### 3. نظام الطلبات
- إنشاء طلبات من السلة
- تتبع حالة الطلب
- إدارة الشحن والتسليم
- معالجة المرتجعات والاسترجاعات

### 4. نظام الدفع
- تكامل مع Stripe
- معالجة آمنة للبطاقات الائتمانية
- دعم المحافظ الرقمية
- فواتير وإيصالات

### 5. نظام التقييمات والمراجعات
- تقييم المنتجات من 1-5 نجوم
- كتابة مراجعات مفصلة
- عرض متوسط التقييمات
- فلترة حسب التقييم

### 6. نظام الإشعارات
- إشعارات الطلبات الجديدة
- إشعارات تحديثات الشحن
- إشعارات العروض الخاصة
- إشعارات تنبيهات الأمان

### 7. البحث والفلترة
- بحث نصي متقدم
- فلترة حسب الفئة
- فلترة حسب السعر
- فلترة حسب التقييم
- ترتيب حسب (السعر، التقييم، الأحدث)

### 8. لوحات التحكم
- **لوحة البائع**: إدارة المتجر والمنتجات والطلبات
- **لوحة المشرف**: إدارة البائعين والمنتجات والطلبات والنظام

---

## التقنيات المستخدمة

### الواجهة الأمامية
- **React 19** - مكتبة واجهة المستخدم
- **Tailwind CSS 4** - تصميم الواجهة
- **TypeScript** - لغة البرمجة
- **Vite** - أداة البناء
- **wouter** - توجيه الصفحات
- **React Query** - إدارة البيانات
- **Framer Motion** - الرسوميات المتحركة
- **Lucide Icons** - الرموز

### الخادم الخلفي
- **Express 4** - إطار عمل الخادم
- **tRPC 11** - واجهة برمجية آمنة الأنواع
- **Node.js** - بيئة التشغيل
- **TypeScript** - لغة البرمجة

### قاعدة البيانات
- **MySQL/TiDB** - قاعدة البيانات العلائقية
- **Drizzle ORM** - مكتبة الوصول للبيانات
- **drizzle-kit** - أداة الترحيل

### الخدمات الخارجية
- **Manus OAuth** - المصادقة
- **Stripe** - معالجة المدفوعات
- **Amazon S3** - التخزين السحابي
- **Manus Notifications** - نظام الإشعارات

### أدوات التطوير
- **pnpm** - مدير الحزم
- **Prettier** - تنسيق الكود
- **ESLint** - التحقق من جودة الكود
- **Vitest** - اختبار الوحدات

---

## التثبيت والإعداد

### المتطلبات
- Node.js 18+
- pnpm 10+
- حساب Manus
- قاعدة بيانات MySQL/TiDB

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone <repository-url>
cd modern-multivendor-shop

# 2. تثبيت الحزم
pnpm install

# 3. إعداد متغيرات البيئة
# انسخ .env.example إلى .env وأدخل القيم

# 4. تشغيل الترحيلات
pnpm db:push

# 5. بدء خادم التطوير
pnpm dev

# 6. فتح المتصفح
# انتقل إلى http://localhost:3000
```

### متغيرات البيئة المطلوبة

```env
# قاعدة البيانات
DATABASE_URL=mysql://user:password@localhost:3306/marketplace

# المصادقة
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Stripe (اختياري)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-key
```

---

## الاختبار والنشر

### الاختبار المحلي

```bash
# تشغيل اختبارات الوحدات
pnpm test

# التحقق من أخطاء TypeScript
pnpm check

# تنسيق الكود
pnpm format

# بناء المشروع
pnpm build
```

### النشر

```bash
# بناء الإصدار الإنتاجي
pnpm build

# بدء الخادم الإنتاجي
pnpm start
```

### قائمة التحقق قبل النشر

- [ ] جميع الاختبارات تمر بنجاح
- [ ] لا توجد أخطاء TypeScript
- [ ] متغيرات البيئة مضبوطة
- [ ] قاعدة البيانات مهاجرة
- [ ] مفاتيح API آمنة
- [ ] الأداء محسّن
- [ ] الأمان تم التحقق منه
- [ ] النسخ الاحتياطية مجهزة

---

## معلومات إضافية

### الدعم والمساعدة
للحصول على الدعم، يرجى التواصل عبر:
- البريد الإلكتروني: support@marketplace.com
- الموقع: https://marketplace.com/support

### الترخيص
هذا المشروع مرخص تحت MIT License

### المساهمة
نرحب بالمساهمات! يرجى قراءة CONTRIBUTING.md للمزيد من المعلومات

---

**آخر تحديث**: يناير 2026
**الإصدار**: 1.0.0
