import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { contentItems } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ContentService implements OnModuleInit {
    constructor(private databaseService: DatabaseService) { }

    async onModuleInit() {
        // Seed initial data if empty
        const count = await this.databaseService.db.select().from(contentItems).limit(1);
        if (count.length === 0) {
            console.log("Seeding initial content items...");

            // Seed Testimonials
            await this.databaseService.db.insert(contentItems).values([
                {
                    type: 'testimonial',
                    data: {
                        nameAr: "سارة محمد",
                        nameEn: "Sarah Mohammed",
                        roleAr: "الرياض",
                        roleEn: "Riyadh",
                        commentAr: "فستان رائع جداً، الخامة ممتازة والتفصيل دقيق. وصلني الطلب في وقت قياسي والتغليف كان فاخراً. شكراً فستان!",
                        commentEn: "Absolutely stunning dress, excellent fabric and precise tailoring. Arrived in record time and packaging was luxurious. Thanks Fustan!",
                        rating: 5,
                        avatar: "S"
                    },
                    displayOrder: 1
                },
                {
                    type: 'testimonial',
                    data: {
                        nameAr: "علياء أحمد",
                        nameEn: "Alia Ahmed",
                        roleAr: "جدة",
                        roleEn: "Jeddah",
                        commentAr: "تجربة تسوق مميزة، الفستان كان أجمل من الصور والمقاس مضبوط تماماً.",
                        commentEn: "Amazing shopping experience, the dress was even more beautiful than the pictures and the fit was perfect.",
                        rating: 5,
                        avatar: "A"
                    },
                    displayOrder: 2
                },
                {
                    type: 'testimonial',
                    data: {
                        nameAr: "نورة فهد",
                        nameEn: "Noura Fahad",
                        roleAr: "الدمام",
                        roleEn: "Dammam",
                        commentAr: "خدمة العملاء جداً متعاونين، والفستان وصل بسرعة. أنصح بالتعامل معكم.",
                        commentEn: "Customer service was very helpful, and the dress arrived quickly. Highly recommend dealing with you.",
                        rating: 5,
                        avatar: "N"
                    },
                    displayOrder: 3
                }
            ]);

            // Seed Social Feed
            await this.databaseService.db.insert(contentItems).values([
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80", link: "#" }, displayOrder: 1 },
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80", link: "#" }, displayOrder: 2 },
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=500&q=80", link: "#" }, displayOrder: 3 },
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80", link: "#" }, displayOrder: 4 },
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&q=80", link: "#" }, displayOrder: 5 },
                { type: 'social_feed', data: { imageUrl: "https://images.unsplash.com/photo-1550614000-4b9519e09063?w=500&q=80", link: "#" }, displayOrder: 6 }
            ]);
        }
    }

    async findAll(type: string) {
        return this.databaseService.db
            .select()
            .from(contentItems)
            .where(eq(contentItems.type, type))
            .orderBy(contentItems.displayOrder);
    }

    async update(id: number, data: any) {
        return this.databaseService.db
            .update(contentItems)
            .set({ data: data, updatedAt: new Date() })
            .where(eq(contentItems.id, id))
            .returning();
    }
}
