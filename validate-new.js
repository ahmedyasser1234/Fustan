
import https from 'https';

const configs = [
    { name: 'P_JPG', url: 'https://pollinations.ai/p/fashion-dress.jpg?width=768&height=1024&seed=42' },
    { name: 'P_Standard', url: 'https://pollinations.ai/p/fashion-dress?width=768&height=1024&seed=42' },
    { name: 'Gen_API', url: 'https://gen.pollinations.ai/image/fashion-dress?width=768&height=1024&seed=42' }
];

function check(config) {
    return new Promise(resolve => {
        const req = https.get(config.url, (res) => {
            console.log(`[${config.name}] Status: ${res.statusCode}`);
            if (res.headers['content-type']) {
                console.log(`   -> Content-Type: ${res.headers['content-type']}`);
            }
            if (res.headers.location) {
                console.log(`   -> Redirect to: ${res.headers.location}`);
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
