
import https from 'https';

const configs = [
    { name: 'Standard', url: 'https://pollinations.ai/p/fashion-dress?width=768&height=1024&seed=42' },
    { name: 'NoLogo', url: 'https://pollinations.ai/p/fashion-dress?width=768&height=1024&seed=42&nologo=true' },
    { name: 'Turbo', url: 'https://pollinations.ai/p/fashion-dress?width=768&height=1024&seed=42&model=turbo' },
    { name: 'Flux', url: 'https://pollinations.ai/p/fashion-dress?width=768&height=1024&seed=42&model=flux' },
    { name: 'Alt Domain', url: 'https://image.pollinations.ai/prompt/fashion-dress?width=768&height=1024&seed=42' }
];

function check(config) {
    return new Promise(resolve => {
        const req = https.get(config.url, (res) => {
            console.log(`[${config.name}] Status: ${res.statusCode}`);
            if (res.statusCode >= 300 && res.statusCode < 400) {
                console.log(`   -> Redirect to: ${res.headers.location}`);
            }
            if (res.headers['content-type']) {
                console.log(`   -> Content-Type: ${res.headers['content-type']}`);
            }
            res.resume();
            resolve();
        });
        req.on('error', (e) => {
            console.log(`[${config.name}] Error: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const config of configs) {
        await check(config);
    }
}

run();
