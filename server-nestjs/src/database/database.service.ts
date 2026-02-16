import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit {
    public db: PostgresJsDatabase<typeof schema>;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const connectionString = this.configService.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined');
        }

        const client = postgres(connectionString);
        this.db = drizzle(client, { schema });
    }
}
