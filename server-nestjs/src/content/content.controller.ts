import { Controller, Get, Patch, Post, Body, Param, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { InstagramService } from './instagram.service';

@Controller('content')
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
        private readonly instagramService: InstagramService
    ) { }

    @Get()
    async findAll(@Query('type') type: string) {
        return this.contentService.findAll(type);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.contentService.update(+id, data);
    }

    @Post('instagram/setup')
    async setupInstagram(@Body() body: { token: string }) {
        await this.instagramService.saveAccessToken(body.token);
        return { success: true, message: 'Instagram token saved and sync started' };
    }

    @Post('instagram/sync')
    async syncInstagram() {
        await this.instagramService.syncFeed();
        return { success: true, message: 'Instagram sync started' };
    }
}
