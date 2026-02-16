import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Adjust path to .env based on where the user runs this script
// Assuming running from project root: ./server-nestjs/.env
// Or if running from inside scripts/: ../server-nestjs/.env
const envPath = path.resolve('server-nestjs/.env');

dotenv.config({ path: envPath });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env');
        console.error('Checking path:', envPath);
        console.error('If running from server-nestjs folder, try: node ../scripts/list-gemini-models.js');
        return;
    }

    console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);

    try {
        const client = new GoogleGenAI({ apiKey: apiKey });

        console.log('📡 Fetching available models...');

        const response = await client.models.list();

        console.log('\n✅ Available Models:');
        if (response && response.models) {
            response.models.forEach(model => {
                console.log(`- ${model.name} (Supported actions: ${model.supportedGenerationMethods})`);
            });
        } else {
            console.log('Response:', JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error('❌ Error listing models:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

listModels();
