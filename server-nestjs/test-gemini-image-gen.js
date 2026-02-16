const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const https = require('https');
require('dotenv').config();

// Fallback env loading
if (!process.env.GEMINI_API_KEY && fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env').toString();
    const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
    }
}

async function testImageGen() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("No API Key"); return; }

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("Attempting to verify available models...");

    // 1. List Models via Native HTTPS (No extra dependencies)
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    await new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        console.error(`List Models Failed: ${res.statusCode} ${res.statusMessage}`);
                        console.error(data);
                    } else {
                        const json = JSON.parse(data);
                        console.log("\n--- Available Models ---");
                        if (json.models) {
                            // Sort for readability
                            const sortedModels = json.models.sort((a, b) => a.name.localeCompare(b.name));
                            sortedModels.forEach(m => {
                                console.log(`- ${m.name}`);
                                if (m.supportedGenerationMethods) {
                                    console.log(`  Methods: ${JSON.stringify(m.supportedGenerationMethods)}`);
                                }
                            });
                        } else {
                            console.log("No models found.");
                        }
                        console.log("------------------------\n");
                    }
                } catch (e) {
                    console.error("Error parsing response:", e.message);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.error("HTTPS Request Failed:", e.message);
            resolve();
        });
    });


    // 2. Test Potential Image Models
    const imageModels = [
        "gemini-2.0-flash-exp",
        "imagen-3.0-generate-001",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ];

    for (const modelName of imageModels) {
        console.log(`\n----------------------------------------`);
        console.log(`Testing Model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            // Simple text prompt for image generation
            const prompt = "A cute robot holding a flower";

            console.log(`Sending prompt: "${prompt}"...`);
            const result = await model.generateContent(prompt);
            const response = result.response;

            // Check for image data
            if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
                console.log(`✅ SUCCESS with ${modelName}: Received inline image data!`);
                console.log(`MimeType: ${response.candidates[0].content.parts[0].inlineData.mimeType}`);
                return;
            } else {
                console.log(`⚠️ ${modelName} returned text/other (Not Image):`);
                if (response.text) {
                    console.log(response.text().substring(0, 100) + "...");
                }
            }

        } catch (error) {
            console.error(`❌ FAILED with ${modelName}: ${error.message}`);
        }
    }
    console.log("\n----------------------------------------");
    console.log("Global test complete.");
}

testImageGen();
