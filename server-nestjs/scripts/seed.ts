
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/database/schema';
import * as dotenv from 'dotenv';
import { eq, or } from 'drizzle-orm';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Categories
    console.log('...Seeding Categories');
    const categoriesData = [
        { nameAr: 'فساتين زفاف', nameEn: 'Wedding Dresses', slug: 'wedding-dresses', image: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/categories/wedding.jpg' },
        { nameAr: 'فساتين سهرة', nameEn: 'Soiree Dresses', slug: 'soiree-dresses', image: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/categories/soiree.jpg' },
        { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abayas', image: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/categories/abayas.jpg' },
        { nameAr: 'كعب عالي', nameEn: 'Heels', slug: 'heels', image: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/categories/heels.jpg' },
        { nameAr: 'اكسسوارات', nameEn: 'Accessories', slug: 'accessories', image: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/categories/accessories.jpg' },
    ];

    for (const cat of categoriesData) {
        const existing = await db.query.categories.findFirst({
            where: eq(schema.categories.slug, cat.slug),
        });

        if (!existing) {
            await db.insert(schema.categories).values({
                ...cat,
                isActive: true,
                displayOrder: 0
            });
            console.log(`   Created category: ${cat.nameEn}`);
        }
    }

    // 2. Seed Admin User
    console.log('...Seeding Admin User');
    const adminEmail = 'admin@fustan.com';
    const existingAdmin = await db.query.users.findFirst({
        where: eq(schema.users.email, adminEmail),
    });

    let adminId;

    if (!existingAdmin) {
        // Password hash for 'password123' (simplified for seed, ideally use bcrypt)
        // In a real app we'd import the auth service to hash, but here we can't easily.
        // Let's assume the Auth service handles login and hashing. 
        // For now, we will create a user. If login fails due to hash mismatch, 
        // the user can reset or register. But since we need an admin to manage things:

        const [newUser] = await db.insert(schema.users).values({
            email: adminEmail,
            name: 'Fustan Admin',
            password: '4065975c6b0bef5fc47b9f54dacd572c:7c5fa605084d96b4848d88d86f13b21f3174308232a8fd0af7ec810690d3237cad03e87c1426e1f22983316a74ff15a85f92d973e785d34140ec25d8b265f053', // 'password123'
            role: 'admin',
            phone: '0500000000',
            openId: 'admin_openid_123',
        }).returning();
        adminId = newUser.id;
        console.log(`   Created admin user: ${adminEmail}`);
    } else {
        adminId = existingAdmin.id;
        console.log(`   Admin user already exists - Updating Password...`);
        await db.update(schema.users)
            .set({
                password: '4065975c6b0bef5fc47b9f54dacd572c:7c5fa605084d96b4848d88d86f13b21f3174308232a8fd0af7ec810690d3237cad03e87c1426e1f22983316a74ff15a85f92d973e785d34140ec25d8b265f053'
            })
            .where(eq(schema.users.id, adminId));
        console.log(`   ✅ Admin password updated`);
    }

    // 3. Seed Vendor
    console.log('...Seeding Default Vendor');
    const vendorSlug = 'fustan-official';
    const existingVendor = await db.query.vendors.findFirst({
        where: or(
            eq(schema.vendors.storeSlug, vendorSlug),
            eq(schema.vendors.userId, adminId)
        ),
    });

    let vendorId;

    if (!existingVendor) {
        const [newVendor] = await db.insert(schema.vendors).values({
            userId: adminId,
            storeNameAr: 'فستان الرسمي',
            storeNameEn: 'Fustan Official',
            storeSlug: vendorSlug,
            descriptionAr: 'المتجر الرسمي لفستان.',
            descriptionEn: 'The official store for Fustan.',
            email: adminEmail,
            logo: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/vendors/logo.jpg',
            phone: '0500000000',
            status: 'active',
            commissionRate: 10,
        }).returning();
        vendorId = newVendor.id;
        console.log(`   Created vendor: Fustan Official`);
    } else {
        vendorId = existingVendor.id;
        console.log(`   Vendor already exists`);
    }

    // 4. Seed Collections (Required for Products)
    console.log('...Seeding Collections');
    // Get a category ID
    const category = await db.query.categories.findFirst();
    if (!category) {
        console.error('No categories found!');
        return;
    }

    const collectionSlug = 'summer-collection-2026';
    const existingCollection = await db.query.collections.findFirst({
        where: eq(schema.collections.slug, collectionSlug),
    });

    let collectionId;
    if (!existingCollection) {
        const [newCollection] = await db.insert(schema.collections).values({
            nameAr: 'تشكيلة الصيف',
            nameEn: 'Summer Collection',
            slug: collectionSlug,
            vendorId: vendorId,
            categoryId: category.id,
            isActive: true,
        }).returning();
        collectionId = newCollection.id;
        console.log(`   Created collection: Summer Collection`);
    } else {
        collectionId = existingCollection.id;
        console.log(`   Collection already exists`);
    }

    // 5. Seed Products
    console.log('...Seeding Products');
    const productSlug = 'luxury-wedding-dress';
    const existingProduct = await db.query.products.findFirst({
        where: eq(schema.products.slug, productSlug),
    });

    if (!existingProduct) {
        await db.insert(schema.products).values({
            nameAr: 'فستان زفاف فاخر',
            nameEn: 'Luxury Wedding Dress',
            slug: productSlug,
            descriptionAr: 'فستان زفاف فاخر وجميل.',
            descriptionEn: 'A beautiful luxury wedding dress.',
            price: 5000,
            originalPrice: 6000,
            vendorPrice: 4500,
            vendorOriginalPrice: 5500,
            stock: 10,
            vendorId: vendorId,
            categoryId: category.id,
            collectionId: collectionId,
            isActive: true,
            isFeatured: true,
            images: ['https://res.cloudinary.com/dk3wwuy5d/image/upload/v1/fustan/products/dress1.jpg'],
            sku: 'WED-001',
            cutType: 'A-Line',
            bodyShape: 'Hourglass',
            impression: 'Classic',
            occasion: 'Wedding',
            sizes: [{ size: 'M', quantity: 5 }, { size: 'L', quantity: 5 }],
        });
        console.log(`   Created product: Luxury Wedding Dress`);
    } else {
        console.log(`   Product already exists`);
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
