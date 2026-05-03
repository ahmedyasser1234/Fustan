import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseService } from '../database/database.service';
import { products, categories } from '../database/schema';
import { eq } from 'drizzle-orm';

@Controller('seo')
export class SeoController {
  constructor(private readonly db: DatabaseService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap(@Res() res: Response) {
    const siteUrl = 'https://fustan.cloud';
    
    // Fetch all products
    const allProducts = await this.db.db.select().from(products);
    
    // Fetch all categories
    const allCategories = await this.db.db.select().from(categories);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/about-us</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact-us</loc>
    <priority>0.5</priority>
  </url>
  ${allCategories.map(cat => `
  <url>
    <loc>${siteUrl}/products?category=${cat.id}</loc>
    <priority>0.7</priority>
  </url>`).join('')}
  ${allProducts.map(prod => `
  <url>
    <loc>${siteUrl}/products/${prod.id}</loc>
    <lastmod>${new Date(prod.updatedAt || prod.createdAt).toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    res.send(sitemap);
  }
}
