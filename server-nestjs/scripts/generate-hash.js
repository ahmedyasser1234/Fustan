
const { scrypt, randomBytes } = require('node:crypto');

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

hashPassword('password123').then(console.log).catch(console.error);
