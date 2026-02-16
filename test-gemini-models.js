
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the server-nestjs directory
dotenv.config({ path: path.resolve(process.cwd(), 'server-nestjs/.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "Found" : "Missing");

    if (!apiKey) {
        console.error("No API Key found. Exiting.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    console.log("Starting model availability test...");

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: '${modelName}'...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            console.log(`✅ SUCCESS with '${modelName}'! Response: ${result.response.text().slice(0, 50)}...`);
        } catch (error) {
            console.log(`❌ FAILED with '${modelName}': ${error.message.split('[')[0]}...`); // Log minimal error
        }
    }
}

listModels();
