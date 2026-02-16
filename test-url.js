
const https = require('https');

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`URL: ${url}`);
            console.log(`Status: ${res.statusCode}`);
            if (res.headers.location) {
                console.log(`Redirect to: ${res.headers.location}`);
            }
            console.log('Content-Type:', res.headers['content-type']);
            res.resume(); // consume response to free memory
            resolve();
        }).on('error', (e) => {
            console.error(`Error fetching ${url}:`, e.message);
            resolve();
        });
    });
}

async function run() {
    console.log('--- Testing Pollinations URLs ---');
    // Test 1: Simple prompt
    await checkUrl('https://pollinations.ai/p/TestImage?width=512&height=512');

    // Test 2: With nologo=true (suspect)
    await checkUrl('https://pollinations.ai/p/TestImage?width=512&height=512&nologo=true');

    // Test 3: With model=flux
    await checkUrl('https://pollinations.ai/p/TestImage?width=512&height=512&model=flux');

    // Test 4: Current implementation equivalent
    const prompt = encodeURIComponent("Full body shot of a fashion model, elegant dress, studio lighting, high quality, 4k");
    await checkUrl(`https://pollinations.ai/p/${prompt}?width=768&height=1024&seed=12345&nologo=true`);
}

run();
