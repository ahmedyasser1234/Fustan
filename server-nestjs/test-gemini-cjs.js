const { GoogleGenerativeAI } = require("@google/generative-ai");
// Try to load .env. If dotenv is not installed as a direct dependency (it might be dev or via nest), we might need to rely on the environment or install it.
// However, NestJS uses @nestjs/config which uses dotenv internally. 
// Let's try to verify if we can simply require 'dotenv'.
try {
    require('dotenv').config();
} catch (e) {
    console.log("dotenv not found, trying to read file directly for GEMINI_API_KEY if needed, or relying on process.env");
}

// Manually read .env if process.env.GEMINI_API_KEY is missing (simple fallback)
const fs = require('fs');
if (!process.env.GEMINI_API_KEY && fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env').toString();
    const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
    }
}

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "Found (" + apiKey.substring(0, 5) + "...)" : "Missing");

    if (!apiKey) {
        console.error("No API Key found. Please check .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    console.log("Starting model availability test...");

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ SUCCESS with '${modelName}'`);
        } catch (error) {
            let msg = error.message || String(error);
            // Clean up error message for readability
            if (msg.includes('404')) msg = '404 Not Found';
            console.log(`❌ FAILED with '${modelName}': ${msg}`);
        }
    }
}

listModels();
