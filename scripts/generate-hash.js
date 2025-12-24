// Script to generate password hash for admin users
// Run: node scripts/generate-hash.js <password>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-hash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nPassword:', password);
console.log('Hash:', hash);
console.log('\nCopy the hash above to lib/auth.ts\n');

