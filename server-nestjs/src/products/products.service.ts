import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  products,
  categories,
  vendors,
  collections,
  productColors,
  users,
} from '../database/schema';
import { eq, and, like, desc, or, SQL } from 'drizzle-orm';
import { CloudinaryService } from '../media/cloudinary.provider';
import { PixVerseService } from '../ai/pixverse.service';

@Injectable()
export class ProductsService {
  constructor(
    private databaseService: DatabaseService,
    private readonly cloudinary: CloudinaryService,
    private readonly pixVerseService: PixVerseService,
  ) {}

  async create(data: any, files: Express.Multer.File[], userId?: number) {
    console.log('⚙️ [Products Service] Processing Create Product...');

    let vendorId = data.vendorId ? parseInt(data.vendorId) : NaN;

    // Security check: If vendor is creating, ensure they use their own vendorId
    if (userId) {
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.role === 'vendor') {
        const vendor = await this.databaseService.db.query.vendors.findFirst({
          where: eq(vendors.userId, userId),
        });
        if (!vendor) throw new BadRequestException('Vendor profile not found');
        vendorId = vendor.id;
      }
    }

    const categoryId = data.categoryId ? parseInt(data.categoryId) : null;

    if (isNaN(vendorId)) {
      throw new BadRequestException('Invalid vendor ID');
    }
    if (!categoryId || isNaN(categoryId)) {
      throw new BadRequestException(
        'Please select a category for this product',
      );
    }

    // 1. Parse JSON data
    const sizesArr =
      typeof data.sizes === 'string'
        ? JSON.parse(data.sizes)
        : data.sizes || [];
    const tagsArr =
      typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags || [];
    const colorVariantsArr =
      typeof data.colorVariants === 'string'
        ? JSON.parse(data.colorVariants)
        : data.colorVariants || [];
    const usagePricesArr =
      typeof data.usagePrices === 'string'
        ? JSON.parse(data.usagePrices)
        : data.usagePrices || [];

    // 2. Identify all files for parallel upload
    const mainFiles = files?.filter((f) => f.fieldname === 'images') || [];
    const aiFile = files?.find((f) => f.fieldname === 'aiQualifiedImage');

    const allVariantFiles: { variantIdx: number; file: Express.Multer.File }[] =
      [];
    colorVariantsArr.forEach((variant, idx) => {
      if (variant.imageFieldPrefix) {
        const vFiles = files.filter((f) =>
          f.fieldname.startsWith(variant.imageFieldPrefix),
        );
        vFiles.forEach((f) =>
          allVariantFiles.push({ variantIdx: idx, file: f }),
        );
      }
    });

    console.log(
      `   - 📷 Uploading ${mainFiles.length + (aiFile ? 1 : 0) + allVariantFiles.length} files in parallel...`,
    );

    // 3. Perform all uploads simultaneously
    const uploadResults = await Promise.all([
      ...mainFiles.map((f) => this.cloudinary.uploadFile(f)),
      ...(aiFile ? [this.cloudinary.uploadFile(aiFile)] : []),
      ...allVariantFiles.map((vf) => this.cloudinary.uploadFile(vf.file)),
    ]);

    // 4. Map results back
    let pointer = 0;
    const mainImageUrls = uploadResults
      .slice(pointer, pointer + mainFiles.length)
      .map((r) => (r as any).secure_url);
    pointer += mainFiles.length;

    let aiQualifiedImageUrl: string | null = null;
    if (aiFile) {
      aiQualifiedImageUrl = (uploadResults[pointer] as any).secure_url;
      pointer += 1;
    }

    const variantImageMap: Record<number, string[]> = {};
    const variantResults = uploadResults.slice(pointer);
    allVariantFiles.forEach((vf, idx) => {
      if (!variantImageMap[vf.variantIdx]) variantImageMap[vf.variantIdx] = [];
      const url = (variantResults[idx] as any).secure_url;
      if (url) variantImageMap[vf.variantIdx].push(url);
    });

    // 5. Calculate pricing
    const vendor = await this.databaseService.db.query.vendors.findFirst({
      where: eq(vendors.id, vendorId),
    });
    const commissionRate = vendor?.commissionRate || 15;
    const commissionFixed = vendor?.commissionFixed || 0;

    const vendorPrice = parseFloat(data.price || '0');
    // Final Price = (Vendor Price * (1 + Commission%)) + Fixed Commission
    const finalPrice =
      vendorPrice * (1 + commissionRate / 100) + commissionFixed;

    const vendorOriginalPrice = parseFloat(
      data.originalPrice || data.price || '0',
    );
    const originalPrice =
      vendorOriginalPrice * (1 + commissionRate / 100) + commissionFixed;

    const rentPrice =
      parseFloat(data.rentPrice || '0') * (1 + commissionRate / 100) +
      (data.rentPrice ? commissionFixed : 0);
    const salePrice =
      parseFloat(data.salePrice || '0') * (1 + commissionRate / 100) +
      (data.salePrice ? commissionFixed : 0);

    const productNameEn = data.nameEn || 'unnamed-product';
    const slug =
      productNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Date.now();

    let totalStock = 0;
    if (Array.isArray(sizesArr)) {
      totalStock = sizesArr.reduce(
        (sum, s) => sum + (parseInt(s.quantity) || 0),
        0,
      );
    }

    // 6. Save to Database
    const newProduct = await this.databaseService.db.transaction(async (tx) => {
      const [insertedProduct] = await tx
        .insert(products)
        .values({
          ...data,
          slug,
          vendorId,
          categoryId,
          images: mainImageUrls,
          aiQualifiedImage: aiQualifiedImageUrl,
          discount: parseFloat(data.discount || '0'),
          vendorPrice,
          vendorOriginalPrice: parseFloat(
            data.originalPrice || data.price || '0',
          ),
          price: finalPrice,
          originalPrice,
          rentPrice,
          salePrice,
          availability: data.availability || 'sale',
          condition: data.condition || 'new',
          usageCount: parseInt(data.usageCount || '0'),
          usagePrices: usagePricesArr,
          stock: totalStock,
          sizes: sizesArr,
        })
        .returning();

      if (Array.isArray(colorVariantsArr)) {
        for (let i = 0; i < colorVariantsArr.length; i++) {
          const variant = colorVariantsArr[i];
          await tx.insert(productColors).values({
            productId: insertedProduct.id,
            colorName: variant.colorName,
            colorCode: variant.colorCode,
            images: variantImageMap[i] || [],
          });
        }
      }
      return insertedProduct;
    });

    // 7. Background AI Task (Non-blocking)
    if (aiQualifiedImageUrl) {
      this.pixVerseService
        .createBackgroundChangeTask(newProduct.id, aiQualifiedImageUrl)
        .catch((err) => console.error('   - ❌ PixVerse failed:', err));
    }

    console.log(
      '✅ [Products Service] Create completed for product:',
      newProduct.id,
    );
    return newProduct;
  }

  async createCustomerListing(
    userId: number,
    data: any,
    files: Express.Multer.File[],
  ) {
    console.log(
      `⚙️ [Products Service] Processing Customer Listing for User ID: ${userId}`,
    );

    // 1. Find or Create Vendor Profile for the Customer
    let vendor = await this.databaseService.db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      console.log('   - Creating Lite Vendor Profile for Customer...');
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) throw new NotFoundException('User not found');

      const storeSlug = `${user.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'user'}-${userId}-${Date.now()}`;

      const [newVendor] = await this.databaseService.db
        .insert(vendors)
        .values({
          userId: userId,
          storeNameAr: user.name || 'متجر عميل',
          storeNameEn: user.name || 'Customer Store',
          storeSlug,
          email: user.email || '',
          status: 'approved',
          isActive: true,
          commissionRate: 20, // Default higher commission for customers
          commissionFixed: 0,
        })
        .returning();
      vendor = newVendor;
    }

    // 2. Prepare data for regular create
    const productData = {
      ...data,
      vendorId: vendor.id,
      isCustomerListing: true,
      isActive: true, // Show immediately
    };

    return this.create(productData, files);
  }

  async findAll(
    query?: string,
    categoryId?: number,
    limit = 20,
    offset = 0,
    vendorId?: number,
    collectionId?: number,
    isCustomerListing?: boolean,
  ) {
    const conditions: SQL[] = [];

    // Default to showing only active products unless a specific vendor is requested (dashboard context)
    if (!vendorId) {
      conditions.push(eq(products.isActive, true));
    } else {
      conditions.push(eq(products.vendorId, vendorId));
    }

    if (query) {
      conditions.push(
        or(
          like(products.nameAr, `%${query}%`),
          like(products.nameEn, `%${query}%`),
        ),
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (collectionId) {
      conditions.push(eq(products.collectionId, collectionId));
    }

    if (isCustomerListing !== undefined) {
      conditions.push(eq(products.isCustomerListing, isCustomerListing));
    }

    const foundProducts = await this.databaseService.db
      .select()
      .from(products)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));

    // Fetch colors for these products
    const productIds = foundProducts.map((p) => p.id);

    if (productIds.length > 0) {
      // Check if inArray is imported, if not use Promise.all or import it
      // Assuming we can use db.query or select from productColors
      const colorsMap = new Map<number, any[]>();

      // We need to import 'inArray' from drizzle-orm if not present.
      // Since I cannot easily add top-level imports in this tool block without risking context,
      // I will use a loop if strict imports are an issue, BUT 'inArray' is standard.
      // Let's assume I need to handle imports separately or use a safe approach.
      // Safer approach without risking missing 'inArray' import if not already there (it is NOT in line 4):
      // I will fetch colors for each product or fetch all.

      const allColors = await this.databaseService.db
        .select()
        .from(productColors)
        .where(or(...productIds.map((id) => eq(productColors.productId, id))));

      allColors.forEach((c) => {
        if (!colorsMap.has(c.productId)) {
          colorsMap.set(c.productId, []);
        }
        colorsMap.get(c.productId)?.push(c);
      });

      return foundProducts.map((p) => ({
        ...p,
        colors: colorsMap.get(p.id) || [],
      }));
    }

    return foundProducts;
  }

  async findOne(id: number) {
    const result = await this.databaseService.db
      .select({
        product: products,
        vendor: {
          id: vendors.id,
          storeNameAr: vendors.storeNameAr,
          storeNameEn: vendors.storeNameEn,
          storeSlug: vendors.storeSlug,
          logo: vendors.logo,
          rating: vendors.rating,
          totalReviews: vendors.totalReviews,
          shippingCost: vendors.shippingCost,
          commissionRate: vendors.commissionRate,
          commissionFixed: vendors.commissionFixed,
          userId: vendors.userId,
        },
        collection: {
          id: collections.id,
          nameAr: collections.nameAr,
          nameEn: collections.nameEn,
          slug: collections.slug,
        },
        category: {
          id: categories.id,
          nameAr: categories.nameAr,
          nameEn: categories.nameEn,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const colors = await this.getProductColors(id);

    return {
      ...result[0],
      colors,
    };
  }

  async findFeatured(limit = 12) {
    return await this.databaseService.db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(limit)
      .orderBy(desc(products.createdAt));
  }

  async getCategories() {
    return await this.databaseService.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(desc(categories.displayOrder));
  }

  async update(
    id: number,
    data: any,
    files?: Express.Multer.File[],
    userId?: number,
  ) {
    const result = await this.findOne(id);
    const product = result.product;

    // Security check: If vendor is updating, ensure they own the product
    if (userId) {
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.role === 'vendor') {
        const vendor = await this.databaseService.db.query.vendors.findFirst({
          where: eq(vendors.userId, userId),
        });
        if (!vendor || product.vendorId !== vendor.id) {
          throw new UnauthorizedException(
            'You are not authorized to update this product',
          );
        }
      }
    }
    const vendor = result.vendor; // Get vendor from findOne

    let imageUrls = product.images || [];
    const mainFiles = files?.filter((f) => f.fieldname === 'images') || [];
    if (mainFiles.length > 0) {
      const uploadPromises = mainFiles.map((file) =>
        this.cloudinary.uploadFile(file),
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results
        .filter((res) => 'secure_url' in res)
        .map((res) => (res as any).secure_url);

      imageUrls = newUrls;
    }

    // Upload AI-Ready Image if provided
    let aiQualifiedImageUrl = product.aiQualifiedImage;
    const aiFile = files?.find((f) => f.fieldname === 'aiQualifiedImage');
    if (aiFile) {
      const result = await this.cloudinary.uploadFile(aiFile);
      if ('secure_url' in result) {
        aiQualifiedImageUrl = result.secure_url;
      }
    }

    const sizesArr =
      typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes;
    const tagsArr =
      typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;

    let totalStock = product.stock;
    if (Array.isArray(sizesArr)) {
      totalStock = sizesArr.reduce(
        (sum, s) => sum + (parseInt(s.quantity) || 0),
        0,
      );
    }

    const categoryId = data.categoryId ? parseInt(data.categoryId) : null;

    const colorVariantsArr =
      typeof data.colorVariants === 'string'
        ? JSON.parse(data.colorVariants)
        : data.colorVariants;

    // Calculate Price with Commission
    const commissionRate = vendor?.commissionRate || 15;
    const commissionFixed = vendor?.commissionFixed || 0;

    const vendorPrice = parseFloat(
      data.price || product.vendorPrice?.toString() || '0',
    );
    const finalPrice =
      vendorPrice * (1 + commissionRate / 100) + commissionFixed;

    const rentPrice = parseFloat(data.rentPrice || '0');
    const salePrice = parseFloat(data.salePrice || '0');

    const finalRentPrice =
      rentPrice * (1 + commissionRate / 100) +
      (data.rentPrice ? commissionFixed : 0);
    const finalSalePrice =
      salePrice * (1 + commissionRate / 100) +
      (data.salePrice ? commissionFixed : 0);

    const usagePricesArr =
      typeof data.usagePrices === 'string'
        ? JSON.parse(data.usagePrices)
        : data.usagePrices;

    return await this.databaseService.db.transaction(async (tx) => {
      const [updatedProduct] = await tx
        .update(products)
        .set({
          ...data,
          sku: data.sku,
          tags: tagsArr,
          cutType: data.cutType,
          bodyShape: data.bodyShape,
          impression: data.impression,
          occasion: data.occasion,
          images: imageUrls,
          aiQualifiedImage: aiQualifiedImageUrl,
          stock: totalStock,
          sizes: sizesArr,
          categoryId: categoryId || product.categoryId,
          vendorPrice: vendorPrice,
          vendorOriginalPrice: parseFloat(
            data.originalPrice || vendorPrice.toString(),
          ),
          price: finalPrice,
          originalPrice:
            parseFloat(data.originalPrice || vendorPrice.toString()) *
            (1 + commissionRate / 100),
          rentPrice: finalRentPrice,
          salePrice: finalSalePrice,
          availability: data.availability || product.availability,
          condition: data.condition || product.condition,
          usageCount: parseInt(
            data.usageCount || product.usageCount?.toString() || '0',
          ),
          usagePrices: usagePricesArr || product.usagePrices,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      // Handle Color Variants
      if (Array.isArray(colorVariantsArr)) {
        const existingColors = await this.getProductColors(id);
        const existingColorIds = existingColors.map((c) => c.id);
        const updatedColorIds = colorVariantsArr
          .filter((v) => v.id)
          .map((v) => v.id);

        // Delete removed colors
        const colorIdsToDelete = existingColorIds.filter(
          (cid) => !updatedColorIds.includes(cid),
        );
        for (const cid of colorIdsToDelete) {
          await tx.delete(productColors).where(eq(productColors.id, cid));
        }

        // Add or update colors
        for (const variant of colorVariantsArr) {
          const variantImages: string[] = variant.existingImages || [];

          // Upload new images if any
          if (variant.imageFieldPrefix) {
            const variantFiles =
              files?.filter((f) =>
                f.fieldname.startsWith(variant.imageFieldPrefix),
              ) || [];
            if (variantFiles.length > 0) {
              const uploadPromises = variantFiles.map((file) =>
                this.cloudinary.uploadFile(file),
              );
              const results = await Promise.all(uploadPromises);

              results.forEach((result) => {
                if ('secure_url' in result) {
                  variantImages.push(result.secure_url);
                }
              });
            }
          }

          if (variant.id) {
            // Update existing color
            await tx
              .update(productColors)
              .set({
                colorName: variant.colorName,
                colorCode: variant.colorCode,
                images: variantImages,
              })
              .where(eq(productColors.id, variant.id));
          } else {
            // Add new color
            await tx.insert(productColors).values({
              productId: id,
              colorName: variant.colorName,
              colorCode: variant.colorCode,
              images: variantImages,
            });
          }
        }
      }

      // Handle AI Background Change automatically if AI-Ready image is updated
      if (
        aiQualifiedImageUrl &&
        aiQualifiedImageUrl !== product.aiQualifiedImage
      ) {
        try {
          console.log(
            `   - ✨ Triggering automatic PixVerse background change for updated product ${id}`,
          );
          await this.pixVerseService.createBackgroundChangeTask(
            id,
            aiQualifiedImageUrl,
          );
        } catch (error) {
          console.error('   - ❌ Automatic PixVerse trigger failed:', error);
        }
      }

      return updatedProduct;
    });
  }

  async remove(id: number, userId?: number) {
    const result = await this.findOne(id);
    const product = result.product;

    // Security check: Ownership validation
    if (userId) {
      const user = await this.databaseService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.role === 'vendor') {
        const vendor = await this.databaseService.db.query.vendors.findFirst({
          where: eq(vendors.userId, userId),
        });
        if (!vendor || product.vendorId !== vendor.id) {
          throw new UnauthorizedException(
            'You are not authorized to delete this product',
          );
        }
      }
    }

    await this.databaseService.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }

  // ==================== Product Colors Management ====================

  async addProductColor(
    productId: number,
    colorData: { colorName: string; colorCode: string; images: string[] },
  ) {
    const [newColor] = await this.databaseService.db
      .insert(productColors)
      .values({
        productId,
        colorName: colorData.colorName,
        colorCode: colorData.colorCode,
        images: colorData.images,
      })
      .returning();

    return newColor;
  }

  async getProductColors(productId: number) {
    return await this.databaseService.db.query.productColors.findMany({
      where: eq(productColors.productId, productId),
    });
  }

  async updateProductColor(
    colorId: number,
    colorData: { colorName?: string; colorCode?: string; images?: string[] },
  ) {
    const [updatedColor] = await this.databaseService.db
      .update(productColors)
      .set(colorData)
      .where(eq(productColors.id, colorId))
      .returning();

    return updatedColor;
  }

  async removeProductColor(colorId: number) {
    await this.databaseService.db
      .delete(productColors)
      .where(eq(productColors.id, colorId));
    return { success: true };
  }
}
