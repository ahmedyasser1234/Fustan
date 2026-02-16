import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { contentItems } from '../database/schema';
import { eq } from 'drizzle-orm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InstagramService {
    private readonly logger = new Logger(InstagramService.name);
    // Updated to Facebook Graph API base URL
    private readonly GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

    constructor(private databaseService: DatabaseService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailySync() {
        this.logger.log('Starting daily Instagram sync...');
        await this.syncFeed();
    }

    async saveAccessToken(token: string) {
        // We will store the token in a special content item with type 'instagram_config'
        // Check if exists
        const existing = await this.databaseService.db
            .select()
            .from(contentItems)
            .where(eq(contentItems.type, 'instagram_config'))
            .limit(1);

        if (existing.length > 0) {
            await this.databaseService.db
                .update(contentItems)
                .set({
                    data: { access_token: token, updated_at: new Date().toISOString() },
                    updatedAt: new Date()
                })
                .where(eq(contentItems.id, existing[0].id));
        } else {
            await this.databaseService.db
                .insert(contentItems)
                .values({
                    type: 'instagram_config',
                    data: { access_token: token, updated_at: new Date().toISOString() },
                    displayOrder: 0
                });
        }

        // Trigger immediate sync after saving token
        this.syncFeed();
    }

    async getAccessToken(): Promise<string | null> {
        const config = await this.databaseService.db
            .select()
            .from(contentItems)
            .where(eq(contentItems.type, 'instagram_config'))
            .limit(1);

        return config.length > 0 ? config[0].data['access_token'] : null;
    }

    async syncFeed() {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                this.logger.warn('No Instagram access token found. Skipping sync.');
                return;
            }

            // 1. Get Instagram Business Account ID
            const businessAccountId = await this.getBusinessAccountId(token);
            if (!businessAccountId) {
                this.logger.error('Could not find Instagram Business Account ID. Ensure the account is Business/Creator and linked to a FB Page.');
                return;
            }

            // 2. Fetch Media using Graph API
            const media = await this.fetchStartMedia(businessAccountId, token);

            if (media && media.data && media.data.length > 0) {
                await this.updateSocialFeed(media.data.slice(0, 6));
                this.logger.log(`Successfully synced ${media.data.length} posts from Instagram Graph API.`);
            }

        } catch (error) {
            this.logger.error('Failed to sync Instagram feed', error);
        }
    }

    // Graph API: We first need to find the connected IG Business Account
    private async getBusinessAccountId(token: string): Promise<string | null> {
        try {
            // Fetch 'me' accounts (FB Pages) and their connected instagram_business_account
            const response = await fetch(`${this.GRAPH_API_BASE}/me/accounts?fields=instagram_business_account&access_token=${token}`);
            const data = await response.json();

            // Look for the first page that has an instagram_business_account
            if (data.data && Array.isArray(data.data)) {
                for (const page of data.data) {
                    if (page.instagram_business_account && page.instagram_business_account.id) {
                        return page.instagram_business_account.id;
                    }
                }
            }
            // Fallback: maybe the token is already pages-scoped or user-scoped in a way 'me' works differently?
            // Usually 'me/accounts' is the standard way for User Access Token.
            return null;
        } catch (error) {
            this.logger.error('Failed to get Business Account ID', error);
            return null;
        }
    }

    private async fetchStartMedia(businessId: string, token: string) {
        try {
            // Get media for the specific Business Account ID
            const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url';
            const response = await fetch(`${this.GRAPH_API_BASE}/${businessId}/media?fields=${fields}&access_token=${token}`);
            return await response.json();
        } catch (error) {
            this.logger.error('Failed to fetch user media', error);
            return null;
        }
    }

    private async updateSocialFeed(posts: any[]) {
        // Strategy: Delete existing social_feed items and insert new ones to ensure order

        await this.databaseService.db
            .delete(contentItems)
            .where(eq(contentItems.type, 'social_feed'));

        const newItems = posts.map((post, index) => ({
            type: 'social_feed',
            data: {
                imageUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
                link: post.permalink,
                caption: post.caption
            },
            displayOrder: index + 1
        }));

        await this.databaseService.db.insert(contentItems).values(newItems);
    }
}
