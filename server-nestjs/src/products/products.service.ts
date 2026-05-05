import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  products,
  categories,
  vendors,
  collections,
  productColors,
  users,
  reviews,
  wishlist,
  cartItems,
  shipping,
  offerItems,
  orderItems,
  aiTasks,
} from '../database/schema';
import { eq, and, like, notLike, desc, or, SQL, inArray, sql } from 'drizzle-orm';
import { CloudinaryService } from '../media/cloudinary.provider';
import { PixVerseService } from '../ai/pixverse.service';
import { PhotoroomService } from '../photoroom/photoroom.service';

export function generateSlug(nameAr: string, nameEn: string): string {
  const base = nameEn?.trim() || nameAr?.trim() || 'product';
  const slug = base
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
  const timestamp = Date.now();
  return slug ? `${slug}-${timestamp}` : `product-${timestamp}`;
}

export function generateSKU(vendorId: number, categoryId: number): string {
  const prefix = 'FST';
  const vendor = String(vendorId).padStart(3, '0');
  const category = String(categoryId).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-V${vendor}-C${category}-${random}`;
}

const PRESET_PROMPTS: Record<string, string> = {
  studio:
    'high-end professional fashion studio with soft lighting, minimalist clean background',
  beach: 'beautiful sunny beach with white sand, turquoise water, tropical vibes, bokeh background',
  sunset: 'golden hour sunset, warm glowing light, elegant outdoor setting',
  street: 'chic urban city street, fashionable bokeh background, daylight',
  flowers:
    'luxurious floral garden, blooming flowers, romantic spring atmosphere',
  goldenlight: 'soft golden light, ethereal atmosphere, luxury indoor setting',
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private databaseService: DatabaseService,
    private readonly cloudinary: CloudinaryService,
    private readonly pixVerseService: PixVerseService,
    private readonly photoroomService: PhotoroomService,
  ) { }

  async create(data: any, files: Express.Multer.File[], userId?: number) {
    this.logger.log('⚙️ [Products Service] Processing Create Product...');

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
    const collectionId = data.collectionId ? parseInt(data.collectionId) : null;

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

    this.logger.log(
      `   - 📷 Uploading ${mainFiles.length + (aiFile ? 1 : 0) + allVariantFiles.length} files in parallel...`,
    );

    // 3. Perform all uploads simultaneously
    // Check if category has a background or use preset from body
    const category = await this.databaseService.db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    let bgUrl = (category as any)?.categoryBackgroundUrl;
    let bgPrompt = (category as any)?.categoryBackgroundPrompt;

    // Background logic:
    // 1. If user explicitly chose a specific preset (not 'category'), use it.
    // 2. Otherwise, use category background if it exists.
    // 3. Fallback to 'studio' preset if nothing else is available.
    if (data.backgroundPreset && data.backgroundPreset !== 'category' && PRESET_PROMPTS[data.backgroundPreset]) {
      bgPrompt = PRESET_PROMPTS[data.backgroundPreset];
      bgUrl = undefined;
    } else if (!bgUrl && !bgPrompt) {
      bgPrompt = PRESET_PROMPTS['studio'];
    }

    this.logger.log(`DEBUG: categoryId=${categoryId}, bgUrl=${bgUrl}, bgPrompt=${bgPrompt}`);

    const processedMainFiles = await Promise.all(
      mainFiles.map(async (f) => {
        if (bgUrl || bgPrompt) {
          try {
            this.logger.log(`   - ✨ Applying PhotoRoom background for image...`);
            const processedBuffer = await this.photoroomService.replaceBackground(
              f.buffer,
              bgUrl,
              bgPrompt,
            );
            return { buffer: processedBuffer, original: f };
          } catch (err) {
            this.logger.error(`   - ❌ PhotoRoom failed: ${err.message}`);
            return { buffer: f.buffer, original: f };
          }
        }
        return { buffer: f.buffer, original: f };
      }),
    );

    const processedVariantFiles = await Promise.all(
      allVariantFiles.map(async (vf) => {
        if (bgUrl || bgPrompt) {
          try {
            this.logger.log(`   - ✨ Applying PhotoRoom background for variant image...`);
            const processedBuffer = await this.photoroomService.replaceBackground(
              vf.file.buffer,
              bgUrl,
              bgPrompt,
            );
            return { ...vf, buffer: processedBuffer };
          } catch (err) {
            this.logger.error(`   - ❌ PhotoRoom failed for variant: ${err.message}`);
            return { ...vf, buffer: vf.file.buffer };
          }
        }
        return { ...vf, buffer: vf.file.buffer };
      }),
    );

    // Process AI image if it exists
    let processedAiBuffer: Buffer | undefined = undefined;
    if (aiFile && (bgUrl || bgPrompt)) {
      try {
        this.logger.log(`   - ✨ Applying PhotoRoom background for AI image...`);
        processedAiBuffer = await this.photoroomService.replaceBackground(
          aiFile.buffer,
          bgUrl,
          bgPrompt,
        );
      } catch (err) {
        this.logger.error(`   - ❌ PhotoRoom failed for AI image: ${err.message}`);
        processedAiBuffer = aiFile.buffer;
      }
    } else if (aiFile) {
      processedAiBuffer = aiFile.buffer;
    }

    const uploadResults = await Promise.all([
      ...processedMainFiles.map((pf) => this.cloudinary.uploadBuffer(pf.buffer)),
      ...(processedAiBuffer ? [this.cloudinary.uploadBuffer(processedAiBuffer)] : []),
      ...processedVariantFiles.map((pvf) => this.cloudinary.uploadBuffer(pvf.buffer)),
    ]);

    // 4. Map results back
    let pointer = 0;
    const mainImageUrls = uploadResults
      .slice(pointer, pointer + mainFiles.length)
      .map((r) => (r as any).secure_url);
    pointer += mainFiles.length;

    /*
    let aiQualifiedImageUrl: string | null = null;
    if (aiFile) {
      aiQualifiedImageUrl = (uploadResults[pointer] as any).secure_url;
      pointer += 1;
    }
    */

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
    const commissionFixed = 0; // vendor?.commissionFixed || 0;

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

    const slug = generateSlug(data.nameAr, data.nameEn);

    let totalStock = 0;
    if (Array.isArray(sizesArr)) {
      totalStock = sizesArr.reduce(
        (sum, s) => sum + (Number(s.quantity) || 0),
        0,
      );
    }

    // 6. Save to Database
    const newProduct = await this.databaseService.db.transaction(async (tx) => {
      // Clean data object to only include safe columns
      const safeData = {
        vendorId,
        collectionId,
        categoryId,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        slug,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        shortDescription: data.shortDescription,
        price: finalPrice,
        originalPrice,
        discount: parseFloat(data.discount || '0'),
        sku: data.sku || generateSKU(vendorId, categoryId),
        stock: totalStock,
        images: mainImageUrls,
        specifications: data.specifications,
        cutType: data.cutType,
        bodyShape: data.bodyShape,
        impression: data.impression,
        occasion: data.occasion,
        rating: 0,
        reviewCount: 0,
        isActive: true,
        isFeatured: data.isFeatured === 'true' || data.isFeatured === true,
        sizes: sizesArr,
      };

      const [insertedProduct] = await tx
        .insert(products)
        .values(safeData)
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
    /*
    if (aiQualifiedImageUrl) {
      this.pixVerseService
        .createBackgroundChangeTask(newProduct.id, aiQualifiedImageUrl)
        .catch((err) => this.logger.error(`   - ❌ PixVerse failed: ${err.message}`));
    }
    */

    this.logger.log(
      `✅ [Products Service] Create completed for product: ${newProduct.id}`,
    );
    return newProduct;
  }

  async createCustomerListing(
    userId: number,
    data: any,
    files: Express.Multer.File[],
  ) {
    this.logger.log(
      `⚙️ [Products Service] Processing Customer Listing for User ID: ${userId}`,
    );

    // 1. Find or Create Vendor Profile for the Customer
    let vendor = await this.databaseService.db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      this.logger.log('   - Creating Lite Vendor Profile for Customer...');
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
          // commissionFixed: 0,
        })
        .returning();
      vendor = newVendor;
    }

    // 2. Prepare data for regular create
    const productData = {
      ...data,
      vendorId: vendor.id,
      // isCustomerListing: true,
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
    isFeatured?: boolean,
    orderBy: 'createdAt' | 'rating' | 'price-low' | 'price-high' = 'createdAt',
  ) {
    const conditions: SQL[] = [];

    // 1. Base visibility conditions
    if (!vendorId) {
      // Public view: only active products from approved & active vendors
      conditions.push(eq(products.isActive, true));
      conditions.push(eq(vendors.status, 'approved'));
      conditions.push(eq(vendors.isActive, true));
    } else {
      // Dashboard view: show all products for this vendor
      conditions.push(eq(products.vendorId, vendorId));
    }

    // 2. Specific Filters
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

    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }

    // Handle isCustomerListing (Marketplace)
    if (isCustomerListing !== undefined) {
      if (isCustomerListing) {
        conditions.push(like(vendors.storeSlug, 'customer-%'));
      } else {
        conditions.push(notLike(vendors.storeSlug, 'customer-%'));
      }
    }

    // 3. Sorting logic
    let order: SQL = desc(products.createdAt);
    if (orderBy === 'rating') {
      order = desc(products.rating);
    } else if (orderBy === 'price-low') {
      order = sql`${products.price} ASC`;
    } else if (orderBy === 'price-high') {
      order = desc(products.price);
    }

    try {
      // Use query builder for join to check vendor status
      const results = await this.databaseService.db
        .select({
          product: products,
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(order);

      const foundProducts = results.map(r => r.product);

      // Fetch colors for these products
      const productIds = foundProducts.map((p) => p.id);

      if (productIds.length > 0) {
        const colorsMap = new Map<number, any[]>();

        const allColors = await this.databaseService.db
          .select()
          .from(productColors)
          .where(inArray(productColors.productId, productIds));

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
    } catch (error: any) {
      this.logger.error(`❌ [Products Service] Database Query Failed: ${error.message}`);
      throw error;
    }
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
          // commissionFixed: vendors.commissionFixed, // NOT in production DB
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

    // Fetch category background (if any)
    const categoryId = data.categoryId ? parseInt(data.categoryId) : product.categoryId;
    const category = categoryId ? await this.databaseService.db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    }) : null;
    let bgUrl = (category as any)?.categoryBackgroundUrl;
    let bgPrompt = (category as any)?.categoryBackgroundPrompt;

    // Background logic:
    // 1. If user explicitly chose a specific preset (not 'category'), use it.
    // 2. Otherwise, use category background if it exists.
    // 3. Fallback to 'studio' preset if nothing else is available.
    if (data.backgroundPreset && data.backgroundPreset !== 'category' && PRESET_PROMPTS[data.backgroundPreset]) {
      bgPrompt = PRESET_PROMPTS[data.backgroundPreset];
      bgUrl = undefined;
    } else if (!bgUrl && !bgPrompt) {
      bgPrompt = PRESET_PROMPTS['studio'];
    }

    let imageUrls = product.images || [];
    const mainFiles = files?.filter((f) => f.fieldname === 'images') || [];
    if (mainFiles.length > 0) {
      const processedMainFiles = await Promise.all(
        mainFiles.map(async (f) => {
          if (bgUrl || bgPrompt) {
            try {
              const processedBuffer = await this.photoroomService.replaceBackground(
                f.buffer,
                bgUrl,
                bgPrompt,
              );
              return { buffer: processedBuffer };
            } catch (err) {
              this.logger.error(`   - ❌ PhotoRoom failed: ${err.message}`);
              return { buffer: f.buffer };
            }
          }
          return { buffer: f.buffer };
        }),
      );

      const uploadPromises = processedMainFiles.map((pf) =>
        this.cloudinary.uploadBuffer(pf.buffer),
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results
        .filter((res) => 'secure_url' in res)
        .map((res) => (res as any).secure_url);

      imageUrls = newUrls;
    }

    // Upload AI-Ready Image if provided (with PhotoRoom if needed)
    let aiQualifiedImageUrl = null;
    const aiFile = files?.find((f) => f.fieldname === 'aiQualifiedImage');
    if (aiFile) {
      let bufferToUpload = aiFile.buffer;
      if (bgUrl || bgPrompt) {
        try {
          this.logger.log(`   - ✨ Applying PhotoRoom background for AI image...`);
          bufferToUpload = await this.photoroomService.replaceBackground(
            aiFile.buffer,
            bgUrl,
            bgPrompt,
          );
        } catch (err) {
          this.logger.error(`   - ❌ PhotoRoom failed for AI image: ${err.message}`);
        }
      }
      const result = await this.cloudinary.uploadBuffer(bufferToUpload);
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
        (sum, s) => sum + (Number(s.quantity) || 0),
        0,
      );
    }

    const collectionId = data.collectionId ? parseInt(data.collectionId) : null;

    const colorVariantsArr =
      typeof data.colorVariants === 'string'
        ? JSON.parse(data.colorVariants)
        : data.colorVariants;

    // Calculate Price with Commission
    const commissionRate = vendor?.commissionRate || 15;
    const commissionFixed = 0; // vendor?.commissionFixed || 0;

    const vendorPrice = parseFloat(
      data.price || (product as any).price?.toString() || '0',
    );
    const finalPrice =
      vendorPrice * (1 + commissionRate / 100) + commissionFixed;

    const vendorOriginalPrice = parseFloat(
      data.originalPrice ||
      data.price ||
      (product as any).price?.toString() ||
      '0',
    );
    const originalPrice =
      vendorOriginalPrice * (1 + commissionRate / 100) + commissionFixed;

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
          categoryId,
          collectionId,
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          descriptionAr: data.descriptionAr,
          descriptionEn: data.descriptionEn,
          shortDescription: data.shortDescription,
          price: finalPrice,
          originalPrice,
          discount: parseFloat(data.discount || '0'),
          sku: data.sku,
          stock: totalStock,
          images: imageUrls,
          specifications: data.specifications,
          cutType: data.cutType,
          bodyShape: data.bodyShape,
          impression: data.impression,
          occasion: data.occasion,
          isActive: data.isActive === 'true' || data.isActive === true,
          isFeatured: data.isFeatured === 'true' || data.isFeatured === true,
          sizes: sizesArr,
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
              const processedVariantFiles = await Promise.all(
                variantFiles.map(async (file) => {
                  if (bgUrl || bgPrompt) {
                    try {
                      const processedBuffer = await this.photoroomService.replaceBackground(
                        file.buffer,
                        bgUrl,
                        bgPrompt,
                      );
                      return { buffer: processedBuffer };
                    } catch (err) {
                      this.logger.error(`   - ❌ PhotoRoom failed for variant: ${err.message}`);
                      return { buffer: file.buffer };
                    }
                  }
                  return { buffer: file.buffer };
                }),
              );

              const uploadPromises = processedVariantFiles.map((pf) =>
                this.cloudinary.uploadBuffer(pf.buffer),
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
      /*
      if (
        aiQualifiedImageUrl &&
        aiQualifiedImageUrl !== (product as any).aiQualifiedImage
      ) {
        try {

          await this.pixVerseService.createBackgroundChangeTask(
            id,
            aiQualifiedImageUrl,
          );
        } catch (err) {
          this.logger.error(`   - ❌ PixVerse failed: ${err.message}`);
        }
      }
      */

      return updatedProduct;
    });
  }

  async remove(id: number, userId?: number) {
    const result = await this.findOne(id);
    const product = result.product;

    if (!product) throw new NotFoundException('Product not found');

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

    // Check if product is in any orders
    const [orderCountResult] = await this.databaseService.db
      .select({ count: sql<number>`count(*)` })
      .from(orderItems)
      .where(eq(orderItems.productId, id));
    
    const count = Number(orderCountResult?.count || 0);
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete product because it has associated orders. Please mark it as inactive instead.',
      );
    }
    
    // Actually, I should use the schema if possible. Let me check if orderItems is imported.
    // It's not. I'll just use raw SQL for this check to avoid more imports if needed, 
    // but better to import it for consistency.

    // I'll update the method to use the transaction properly.
    return await this.databaseService.db.transaction(async (tx) => {
      // 1. Delete dependent records
      await tx.delete(productColors).where(eq(productColors.productId, id));
      await tx.delete(reviews).where(eq(reviews.productId, id));
      await tx.delete(wishlist).where(eq(wishlist.productId, id));
      await tx.delete(cartItems).where(eq(cartItems.productId, id));
      await tx.delete(shipping).where(eq(shipping.productId, id));
      await tx.delete(offerItems).where(eq(offerItems.productId, id));
      await tx.delete(aiTasks).where(and(eq(aiTasks.targetId, id), eq(aiTasks.type, 'background_change')));
      // also virtual try on tasks? they might be linked to product or user. 
      // if targetId is productId, delete them.
      await tx.delete(aiTasks).where(and(eq(aiTasks.targetId, id), eq(aiTasks.type, 'virtual_try_on')));

      // 2. Finally delete the product
      const deleteResult = await tx.delete(products).where(eq(products.id, id));
      
      return { success: true };
    });
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
