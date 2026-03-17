
import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../media/cloudinary.provider';
import { DatabaseService } from '../database/database.service';
import { collections, products, categories } from '../database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

@Injectable()
export class CollectionsService {
    constructor(
        private readonly db: DatabaseService,
        private readonly cloudinary: CloudinaryService
    ) { }

    async create(data: { nameAr: string; nameEn: string; vendorId: number; description?: string; image?: Express.Multer.File; categoryId: number }) {
        let coverImage = "";

        if (data.image) {
            try {
                const upload = await this.cloudinary.uploadFile(data.image);
                console.log("Cloudinary Upload Result:", upload);
                if ('secure_url' in upload) {
                    coverImage = upload.secure_url;
                }
            } catch (error) {
                console.error("Image upload failed:", error);
                // Proceed without image
            }
        }

        if (!data.categoryId) {
            throw new NotFoundException('Category is required');
        }

        const category = await this.db.db.query.categories.findFirst({
            where: eq(categories.id, data.categoryId),
        });

        if (!category) {
            throw new NotFoundException('Invalid Category ID');
        }

        // Generate slug from English name
        let slug = data.nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!slug) slug = `collection-${Date.now()}`;

        try {
            console.log("Creating collection with data:", { ...data, image: data.image ? 'File present' : 'No file', slug });

            const [collection] = await this.db.db
                .insert(collections)
                .values({
                    nameAr: data.nameAr,
                    nameEn: data.nameEn,
                    vendorId: data.vendorId,
                    description: data.description,
                    slug: `${slug}-${Date.now()}`,
                    coverImage,
                    categoryId: data.categoryId, // Add categoryId
                })
                .returning();

            return collection;
        } catch (error) {
            console.error("Database Insert Error:", error);
            throw error;
        }
    }

    async findAll(vendorId?: number, categoryId?: number) {
        // Subquery to count products per collection
        const pc = this.db.db
            .select({
                collectionId: products.collectionId,
                count: sql<number>`count(${products.id})`.as('count')
            })
            .from(products)
            .groupBy(products.collectionId)
            .as('pc');

        const query = this.db.db
            .select({
                id: collections.id,
                nameAr: collections.nameAr,
                nameEn: collections.nameEn,
                description: collections.description,
                coverImage: collections.coverImage,
                slug: collections.slug,
                vendorId: collections.vendorId,
                categoryId: collections.categoryId,
                isActive: collections.isActive,
                createdAt: collections.createdAt,
                productsCount: sql<number>`coalesce(${pc.count}, 0)`.as('productsCount')
            })
            .from(collections)
            .leftJoin(pc, eq(collections.id, pc.collectionId));

        const conditions = [];
        console.log("Collections findAll Params:", { vendorId, categoryId });

        // Correctly handle vendorId 0 (Admin) vs specific Vendor
        if (vendorId !== undefined && vendorId !== null && !isNaN(vendorId)) {
            if (vendorId !== 0) {
                // Return vendor's own collections OR global ones (vendorId 0)
                conditions.push(sql`(${collections.vendorId} = ${vendorId} OR ${collections.vendorId} = 0)`);
            } else {
                console.log("   - Admin View (vendorId 0): No vendor filter applied.");
            }
        }

        if (categoryId !== undefined && categoryId !== null && !isNaN(categoryId) && categoryId !== 0) {
            conditions.push(eq(collections.categoryId, categoryId));
        }

        let results;
        if (conditions.length > 0) {
            results = await query.where(and(...conditions)).orderBy(desc(collections.createdAt));
        } else {
            results = await query.orderBy(desc(collections.createdAt));
        }

        console.log(`   - Query Execution Finished. Found ${results.length} collections.`);
        return results;
    }

    async findOne(id: number) {
        const collection = await this.db.db.query.collections.findFirst({
            where: eq(collections.id, id),
        });
        if (!collection) throw new NotFoundException('Collection not found');
        return collection;
    }

    async update(id: number, data: any) {
        const updateData: any = { ...data };
        const imageFile = updateData.image;
        delete updateData.image;

        if (imageFile) {
            try {
                const upload = await this.cloudinary.uploadFile(imageFile);
                if ('secure_url' in upload) {
                    updateData.coverImage = upload.secure_url;
                }
            } catch (error) {
                console.error("Image upload failed during update:", error);
            }
        }

        if (updateData.categoryId) {
            const category = await this.db.db.query.categories.findFirst({
                where: eq(categories.id, updateData.categoryId),
            });
            if (!category) {
                throw new NotFoundException('Invalid Category ID');
            }
        }

        const [updated] = await this.db.db
            .update(collections)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(collections.id, id))
            .returning();
        return updated;
    }

    async remove(id: number) {
        await this.db.db.delete(collections).where(eq(collections.id, id));
        return { success: true };
    }
}
