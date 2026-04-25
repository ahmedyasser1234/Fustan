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
  ) {}

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
    console.log('⚙️ [Categories Service] Processing Create Category...');

    let imageUrl = data.image || null;
    let aiBackgroundImageUrl = data.aiBackgroundImage || null;

    // Upload images if files are provided
    for (const file of files || []) {
      if (
        file.fieldname === 'image' ||
        file.fieldname === 'aiBackgroundImage'
      ) {
        try {
          const result = await this.cloudinary.uploadFile(file);
          if ('secure_url' in result) {
            if (file.fieldname === 'image') imageUrl = result.secure_url;
            if (file.fieldname === 'aiBackgroundImage')
              aiBackgroundImageUrl = result.secure_url;
          }
        } catch (error) {
          console.error(
            `❌ Cloudinary Upload Failed for ${file.fieldname}:`,
            error,
          );
        }
      }
    }

    // Improved Slug Generation
    let slug = (data.nameEn || data.nameAr || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Allow Arabic chars
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    if (!slug || slug.length < 2) {
      slug = `cat-${Date.now()}`;
    }

    // Ensure uniqueness
    const existing = await this.databaseService.db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const displayOrder = parseInt(data.displayOrder?.toString() || '0');

    try {
      const insertValues = {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        image: imageUrl,
        aiBackgroundImage: aiBackgroundImageUrl,
        slug,
        displayOrder,
      };

      const [newCategory] = await this.databaseService.db
        .insert(categories)
        .values(insertValues)
        .returning();

      return newCategory;
    } catch (error) {
      console.error('❌ [Categories Service] Database Insert Failed:', error);
      if (error.code === '23505') {
        throw new Error(`A category with this slug or name already exists`);
      }
      throw error;
    }
  }

  async update(id: number, data: any, files: Express.Multer.File[]) {
    let imageUrl = data.image;
    let aiBackgroundImageUrl = data.aiBackgroundImage;

    // Upload images if files are provided
    for (const file of files || []) {
      if (
        file.fieldname === 'image' ||
        file.fieldname === 'aiBackgroundImage'
      ) {
        const result = await this.cloudinary.uploadFile(file);
        if ('secure_url' in result) {
          if (file.fieldname === 'image') imageUrl = result.secure_url;
          if (file.fieldname === 'aiBackgroundImage')
            aiBackgroundImageUrl = result.secure_url;
        }
      }
    }

    const [updatedCategory] = await this.databaseService.db
      .update(categories)
      .set({
        ...data,
        image: imageUrl,
        aiBackgroundImage: aiBackgroundImageUrl,
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
