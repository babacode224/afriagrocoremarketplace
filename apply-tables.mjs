import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Read and split the SQL file
const sql = fs.readFileSync('./drizzle/0001_old_photon.sql', 'utf8');
const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    const match = stmt.match(/CREATE TABLE `([^`]+)`/);
    if (match) console.log(`Created table: ${match[1]}`);
  } catch(e) {
    const match = stmt.match(/CREATE TABLE `([^`]+)`/);
    if (match) console.log(`Skip ${match[1]}: ${e.message.substring(0, 60)}`);
    else console.log('Skip stmt:', e.message.substring(0, 60));
  }
}

await conn.end();
console.log('All tables applied!');
