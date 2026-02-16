
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const possibleHbaPaths = [
    'C:\\Program Files\\PostgreSQL\\17\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\16\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\15\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\14\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\13\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\12\\data\\pg_hba.conf',
];

function modifyHba() {
    let hbaPath = '';
    for (const p of possibleHbaPaths) {
        if (fs.existsSync(p)) {
            hbaPath = p;
            break;
        }
    }

    if (!hbaPath) {
        console.error('❌ Could not find pg_hba.conf. Is PostgreSQL installed in standard directory?');
        process.exit(1);
    }

    console.log(`Found pg_hba.conf at: ${hbaPath}`);
    const content = fs.readFileSync(hbaPath, 'utf-8');

    // Backup first
    fs.writeFileSync(hbaPath + '.bak', content);
    console.log('Backed up original file.');

    // Change md5/scram-sha-256 to trust for localhost
    const newContent = content.replace(
        /(host\s+all\s+all\s+127\.0\.0\.1\/32\s+)(md5|scram-sha-256)/g,
        '$1trust'
    ).replace(
        /(host\s+all\s+all\s+::1\/128\s+)(md5|scram-sha-256)/g,
        '$1trust'
    );

    if (newContent === content) {
        console.log('⚠️ Config already seems to be set to trust or format unrecognized.');
    } else {
        fs.writeFileSync(hbaPath, newContent);
        console.log('✅ Updated pg_hba.conf to allow trust authentication.');
        console.log('You must restart the PostgreSQL service now.');
        try {
            execSync('net stop postgresql-x64-16', { stdio: 'inherit' }); // Guessing service name
            execSync('net start postgresql-x64-16', { stdio: 'inherit' });
            console.log('Service restarted (attempted).');
        } catch (e) {
            console.log('Could not restart service automatically. Please restart it manually.');
        }
    }
}

modifyHba();
