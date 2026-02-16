
import https from 'https';

const url = 'https://hercai.onrender.com/v3/text2image?prompt=fashion-dress-red-elegant';

function check() {
    console.log(`Fetching: ${url}`);
    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Body:', data.substring(0, 500)); // Print first 500 chars
        });
    }).on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });
}

check();
