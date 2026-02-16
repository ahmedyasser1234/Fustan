import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { categories } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CloudinaryService } from '../media/cloudinary.provider';

@Injectable()
export class CategoriesService {
    constructor(
        private databaseService: DatabaseService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    async findAll() {
        return await this.databaseService.db
            .select()
            .from(categories)
            .where(eq(categories.isActive, true))
            .orderBy(desc(categories.displayOrder));
    }

    async findOne(id: number) {
        const result = await this.databaseService.db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        return result[0] || null;
    }

    async create(data: any, files: Express.Multer.File[]) {
        let imageUrl = data.image || null;

        // Upload image if file is provided
        const imageFile = files?.find(f => f.fieldname === 'image');
        if (imageFile) {
            const result = await this.cloudinary.uploadFile(imageFile);
            if ('secure_url' in result) {
                imageUrl = result.secure_url;
            }
        }

        let slug = (data.nameEn || data.nameAr).toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Allow Arabic chars
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');

        if (!slug || slug.length < 2) {
            slug = `category-${Date.now()}`;
        }

        // Ensure uniqueness (simple append)
        const existing = await this.databaseService.db.query.categories.findFirst({
            where: eq(categories.slug, slug)
        });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const [newCategory] = await this.databaseService.db
            .insert(categories)
            .values({
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                descriptionAr: data.descriptionAr || null,
                descriptionEn: data.descriptionEn || null,
                image: imageUrl,
                slug,
                displayOrder: data.displayOrder || 0,
            })
            .returning();

        return newCategory;
    }

    async update(id: number, data: any, files: Express.Multer.File[]) {
        let imageUrl = data.image;

        // Upload image if file is provided
        const imageFile = files?.find(f => f.fieldname === 'image');
        if (imageFile) {
            const result = await this.cloudinary.uploadFile(imageFile);
            if ('secure_url' in result) {
                imageUrl = result.secure_url;
            }
        }

        const [updatedCategory] = await this.databaseService.db
            .update(categories)
            .set({
                ...data,
                image: imageUrl,
                updatedAt: new Date(),
            })
            .where(eq(categories.id, id))
            .returning();

        return updatedCategory;
    }

    async remove(id: number) {
        await this.databaseService.db
            .delete(categories)
            .where(eq(categories.id, id));

        return { success: true };
    }
}
