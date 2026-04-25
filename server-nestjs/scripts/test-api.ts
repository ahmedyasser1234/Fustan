
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('Testing API Endpoints with fetch...');

    try {
        // 1. Get Vendor
        const slug = 'store-4-1770232137581';

        console.log(`Fetching vendor: ${slug}`);
        const vendorRes = await fetch(`${API_URL}/vendors/${slug}`);
        if (!vendorRes.ok) throw new Error(`Vendor fetch failed: ${vendorRes.status}`);
        const vendor = await vendorRes.json();
        console.log('Vendor found:', vendor.id, vendor.storeNameAr);

        if (vendor && vendor.id) {
            // 2. Get Products for Vendor
            console.log(`Fetching products for vendor ${vendor.id}...`);
            const productsRes = await fetch(`${API_URL}/products?vendorId=${vendor.id}`);
            if (!productsRes.ok) throw new Error(`Products fetch failed: ${productsRes.status}`);
            const products = await productsRes.json();
            console.log(`Products found: ${products.length}`);
            products.forEach((p: any) => console.log(`- ${p.nameAr} (${p.price})`));

            // 3. Get Reviews for Vendor
            console.log(`Fetching reviews for vendor ${vendor.id}...`);
            const reviewsRes = await fetch(`${API_URL}/reviews/vendor/${vendor.id}`);
            if (!reviewsRes.ok) throw new Error(`Reviews fetch failed: ${reviewsRes.status}`);
            const reviews = await reviewsRes.json();
            console.log(`Reviews found: ${reviews.length}`);
            reviews.forEach((r: any) => console.log(`- ${r.comment} (${r.rating} stars)`));
        }

    } catch (error: any) {
        console.error('API Test Failed:', error.message);
    }
}

main();
