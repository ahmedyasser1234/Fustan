import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testSecurity() {
    console.log('🛡️ Testing Security Configuration...');

    try {
        // 1. Check Security Headers
        console.log('\nChecking Security Headers...');
        const response = await axios.get(`${API_URL}/categories`); // Public endpoint

        const headers = response.headers;
        // Helmet adds Content-Security-Policy, X-Frame-Options, etc.
        if (headers['content-security-policy'] || headers['x-frame-options']) {
            console.log('✅ Security Headers Found:', {
                'Content-Security-Policy': headers['content-security-policy'],
                'X-Frame-Options': headers['x-frame-options'],
                'Strict-Transport-Security': headers['strict-transport-security']
            });
        } else {
            console.log('❌ Security Headers Missing!');
        }

        // 2. Check Rate Limiting
        console.log('\nChecking Rate Limiting (Throttler)...');
        console.log('Sending 15 requests quickly (Limit is 100/min, so this should pass, but we verify response headers)...');

        const requests = [];
        for (let i = 0; i < 15; i++) {
            requests.push(axios.get(`${API_URL}/categories`));
        }

        const responses = await Promise.all(requests);
        const lastResponse = responses[responses.length - 1];

        console.log('✅ Last Response Headers:', lastResponse.headers);

        // Check for RateLimit headers (case-insensitive)
        const limit = lastResponse.headers['x-ratelimit-limit'] || lastResponse.headers['ratelimit-limit'];
        const remaining = lastResponse.headers['x-ratelimit-remaining'] || lastResponse.headers['ratelimit-remaining'];

        console.log('✅ Rate Limit Check:', {
            'Limit': limit,
            'Remaining': remaining,
        });

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection Failed: The server is not running on http://localhost:3001');
            console.error('👉 Please start the server using: pnpm server:dev');
        } else {
            console.error('❌ Test Failed:', error.message);
            if (error.response) {
                console.log('Response Status:', error.response.status);
                console.log('Response Headers:', error.response.headers);
            } else {
                console.error('Full Error:', error);
            }
        }
    }
}

testSecurity();
