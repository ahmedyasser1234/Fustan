const http = require('http');

const data = JSON.stringify({
    productName: 'Test Dress',
    height: '170',
    weight: '60',
    bust: '90',
    waist: '70',
    hips: '95'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/ai/try-on', // Note: Check if prefix is /api or just /
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
