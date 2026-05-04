require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
console.log('ENV LOADED');
process.exit(0);
