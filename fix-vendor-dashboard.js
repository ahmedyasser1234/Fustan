const fs = require('fs');

const filePath = 'client/src/pages/VendorDashboard.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Add the CouponsTab import after the toast import
if (!content.includes('import { CouponsTab }')) {
    content = content.replace(
        'import { toast } from "sonner";',
        'import { toast } from "sonner";\nimport { CouponsTab } from "@/components/dashboard/CouponsTab";'
    );
}

// Update the activeTab type to include "coupons"
content = content.replace(
    'return (params.get("tab") as "overview" | "products" | "orders" | "settings" | "collections" | "categories") || "overview";',
    'return (params.get("tab") as "overview" | "products" | "orders" | "settings" | "collections" | "categories" | "coupons") || "overview";'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ VendorDashboard.tsx updated successfully!');
console.log('- Added CouponsTab import');
console.log('- Updated activeTab type to include "coupons"');
