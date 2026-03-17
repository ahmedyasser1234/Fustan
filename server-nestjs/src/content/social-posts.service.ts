import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InstagramService } from './instagram.service';

@Injectable()
export class SocialPostsService {
    private readonly logger = new Logger(SocialPostsService.name);

    constructor(
        private databaseService: DatabaseService,
        private instagramService: InstagramService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleScheduledPosts() {
        this.logger.log('Checking for scheduled social posts...');
        
        const now = new Date();
        const pendingPosts = await this.databaseService.db
            .select()
            .from(schema.vendorRequests)
            .where(
                and(
                    eq(schema.vendorRequests.type, 'social_post_request'),
                    eq(schema.vendorRequests.status, 'approved'),
                    eq(schema.vendorRequests.isExecuted, false),
                    lte(schema.vendorRequests.scheduledAt, now)
                )
            );

        if (pendingPosts.length === 0) {
            return;
        }

        this.logger.log(`Found ${pendingPosts.length} posts to execute.`);

        for (const post of pendingPosts) {
            try {
                await this.executePost(post);
                await this.databaseService.db
                    .update(schema.vendorRequests)
                    .set({ isExecuted: true, updatedAt: new Date() })
                    .where(eq(schema.vendorRequests.id, post.id));
                
                this.logger.log(`Successfully executed social post ID: ${post.id}`);
            } catch (error) {
                this.logger.error(`Failed to execute social post ID: ${post.id}`, error);
            }
        }
    }

    private async executePost(post: any) {
        const { mediaUrls, caption, platforms } = post.data;
        
        if (platforms.includes('instagram')) {
            await this.publishToInstagram(mediaUrls, caption);
        }
        
        // Add more platforms as needed (Facebook, Pinterest, etc.)
    }

    private async publishToInstagram(mediaUrls: string[], caption: string) {
        const token = await this.instagramService.getAccessToken();
        if (!token) {
            throw new Error('No Instagram access token available');
        }

        // Logic for publishing to Instagram via Graph API
        // 1. Create Media Container
        // 2. Publish Media
        // For now, we'll log the intention as we need a validated business account for actual publishing
        this.logger.log(`[MOCK] Publishing to Instagram: ${caption} with ${mediaUrls.length} images`);
        
        // Real implementation would involve multiple fetch calls to https://graph.facebook.com/
    }
}
