const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // replace ` && !!localStorage.getItem('app_token')` with ``
            content = content.replace(/ && !!localStorage\.getItem\('app_token'\)/g, '');
            
            // For files like Wishlist or Orders that had `enabled: !!localStorage.getItem('app_token')`
            // If there's a `const { isAuthenticated } = useAuth();` in the file, we can use `isAuthenticated`.
            // But let's just do a manual replace for the specific lines.
            content = content.replace(/!!localStorage\.getItem\('app_token'\)/g, 'true /* token check removed */');
            
            content = content.replace(/const token = localStorage\.getItem\('app_token'\);/g, '// token check removed');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}
processDir('G:/koko/Fustan-main/client/src');
