import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await conn.execute('ALTER TABLE `products` MODIFY COLUMN `images` json');
  console.log('images column modified');
} catch(e) { console.log('images skip:', e.message); }
try {
  await conn.execute('ALTER TABLE `products` MODIFY COLUMN `tags` json');
  console.log('tags column modified');
} catch(e) { console.log('tags skip:', e.message); }

// Check users table has new columns
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `phone` varchar(32)');
  console.log('phone added');
} catch(e) { console.log('phone:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `userRole` enum("buyer","farmer","logistics","storage","input_supplier","machinery_dealer","admin") NOT NULL DEFAULT "buyer"');
  console.log('userRole added');
} catch(e) { console.log('userRole:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `avatarUrl` text');
  console.log('avatarUrl added');
} catch(e) { console.log('avatarUrl:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `bio` text');
  console.log('bio added');
} catch(e) { console.log('bio:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `location` varchar(255)');
  console.log('location added');
} catch(e) { console.log('location:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `isVerified` boolean NOT NULL DEFAULT false');
  console.log('isVerified added');
} catch(e) { console.log('isVerified:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `isActive` boolean NOT NULL DEFAULT true');
  console.log('isActive added');
} catch(e) { console.log('isActive:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `businessName` varchar(255)');
  console.log('businessName added');
} catch(e) { console.log('businessName:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `businessRegNo` varchar(128)');
  console.log('businessRegNo added');
} catch(e) { console.log('businessRegNo:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `rating` decimal(3,2) DEFAULT "0.00"');
  console.log('rating added');
} catch(e) { console.log('rating:', e.message); }
try {
  await conn.execute('ALTER TABLE `users` ADD COLUMN `totalReviews` int DEFAULT 0');
  console.log('totalReviews added');
} catch(e) { console.log('totalReviews:', e.message); }

await conn.end();
console.log('Migration fix complete!');
