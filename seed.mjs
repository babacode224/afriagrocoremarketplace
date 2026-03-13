import mysql from "mysql2/promise";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("No DATABASE_URL"); process.exit(1); }

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "afriagrocore_salt_2024").digest("hex");
}
function generateOpenId(email) {
  return "local_" + crypto.createHash("md5").update(email).digest("hex");
}

const conn = await mysql.createConnection(DB_URL);
console.log("✅ Connected to database");

// ── 1. Create test users ──────────────────────────────────────────────────────
const testUsers = [
  { name: "Admin User", email: "admin@afriagrocore.com", password: "admin", role: "admin", userRole: "admin", phone: "+1-555-0001", country: "Kenya", region: "Nairobi", bio: "Platform administrator with full access to all features." },
  { name: "Kwame Mensah", email: "farmer@afriagrocore.com", password: "farmer", role: "user", userRole: "farmer", phone: "+233-555-0002", country: "Ghana", region: "Ashanti", bio: "Organic farmer specializing in vegetables and grains." },
  { name: "Amina Diallo", email: "buyer@afriagrocore.com", password: "buyer", role: "user", userRole: "buyer", phone: "+221-555-0003", country: "Senegal", region: "Dakar", bio: "Food distributor buying fresh produce for restaurants." },
  { name: "Chidi Okafor", email: "logistics@afriagrocore.com", password: "logistics", role: "user", userRole: "logistics", phone: "+234-555-0004", country: "Nigeria", region: "Lagos", bio: "Logistics partner with a fleet of refrigerated trucks." },
  { name: "Fatima Nkosi", email: "storage@afriagrocore.com", password: "storage", role: "user", userRole: "storage", phone: "+27-555-0005", country: "South Africa", region: "Gauteng", bio: "Cold storage facility operator with 5000 sq ft capacity." },
  { name: "Ibrahim Traoré", email: "supplier@afriagrocore.com", password: "supplier", role: "user", userRole: "input_supplier", phone: "+226-555-0006", country: "Burkina Faso", region: "Ouagadougou", bio: "Agricultural input supplier providing seeds, fertilizers, and pesticides." },
  { name: "Emeka Dealer", email: "dealer@afriagrocore.com", password: "dealer", role: "user", userRole: "machinery_dealer", phone: "+234-555-0007", country: "Nigeria", region: "Kano", bio: "Farm machinery dealer specializing in tractors and harvesters." },
];

const userIds = {};
for (const u of testUsers) {
  const openId = generateOpenId(u.email);
  const passwordHash = hashPassword(u.password);
  try {
    await conn.execute(
      `INSERT INTO users (openId, name, email, passwordHash, loginMethod, role, userRole, phone, country, region, bio, isVerified, isActive, lastSignedIn, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'email', ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE name=VALUES(name), passwordHash=VALUES(passwordHash), role=VALUES(role), userRole=VALUES(userRole), phone=VALUES(phone), country=VALUES(country), region=VALUES(region), bio=VALUES(bio), isVerified=1`,
      [openId, u.name, u.email, passwordHash, u.role, u.userRole, u.phone, u.country, u.region, u.bio]
    );
    const [rows] = await conn.execute("SELECT id FROM users WHERE email=?", [u.email]);
    userIds[u.userRole] = rows[0].id;
    console.log(`✅ Created user: ${u.name} (${u.userRole}) - ID: ${rows[0].id}`);
  } catch (e) {
    console.error(`❌ Error creating ${u.email}:`, e.message);
  }
}

const farmerId = userIds["farmer"];
const buyerId = userIds["buyer"];
const logisticsId = userIds["logistics"];
const storageId = userIds["storage"];
const supplierId = userIds["input_supplier"];
const dealerId = userIds["machinery_dealer"];

// ── 2. Create products ────────────────────────────────────────────────────────
const products = [
  // Farm Produce (farmer)
  { sellerId: farmerId, name: "Organic Tomatoes", description: "Fresh organic tomatoes grown without pesticides. Perfect for cooking and salads.", category: "produce", subcategory: "Vegetables", price: "2.50", unit: "kg", stock: 500, imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 1, isApproved: 1, rating: "4.8", reviewCount: 24 },
  { sellerId: farmerId, name: "Fresh Maize (Corn)", description: "High-quality yellow maize harvested this season. Suitable for human consumption and animal feed.", category: "produce", subcategory: "Grains", price: "0.80", unit: "kg", stock: 2000, imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 0, isApproved: 1, rating: "4.5", reviewCount: 18 },
  { sellerId: farmerId, name: "Cassava Roots", description: "Fresh cassava roots, ideal for making fufu, garri, and tapioca.", category: "produce", subcategory: "Root Vegetables", price: "0.60", unit: "kg", stock: 1500, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 1, isApproved: 1, rating: "4.3", reviewCount: 12 },
  { sellerId: farmerId, name: "Plantains (Green)", description: "Unripe green plantains, great for boiling, frying, and making chips.", category: "produce", subcategory: "Fruits", price: "1.20", unit: "bunch", stock: 300, imageUrl: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 1, isApproved: 1, rating: "4.6", reviewCount: 9 },
  { sellerId: farmerId, name: "Yam Tubers", description: "Large white yam tubers, freshly harvested. Perfect for pounding and boiling.", category: "produce", subcategory: "Root Vegetables", price: "1.50", unit: "kg", stock: 800, imageUrl: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 0, isApproved: 1, rating: "4.4", reviewCount: 15 },
  // Livestock (farmer)
  { sellerId: farmerId, name: "Live Broiler Chickens", description: "Healthy broiler chickens, 6-8 weeks old, ready for slaughter. Average weight 2.5kg.", category: "livestock", subcategory: "Poultry", price: "12.00", unit: "piece", stock: 200, imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 0, isApproved: 1, rating: "4.7", reviewCount: 31 },
  { sellerId: farmerId, name: "Goats (West African Dwarf)", description: "Healthy WAD goats, vaccinated and dewormed. 6-12 months old.", category: "livestock", subcategory: "Small Ruminants", price: "85.00", unit: "piece", stock: 50, imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400", location: "Kumasi, Ghana", country: "Ghana", isOrganic: 0, isApproved: 1, rating: "4.5", reviewCount: 8 },
  // Farm Inputs (supplier)
  { sellerId: supplierId, name: "NPK Fertilizer 15-15-15", description: "Balanced NPK fertilizer suitable for all crops. 50kg bag.", category: "farm_inputs", subcategory: "Fertilizers", price: "45.00", unit: "bag", stock: 1000, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", location: "Ouagadougou, Burkina Faso", country: "Burkina Faso", isOrganic: 0, isApproved: 1, rating: "4.6", reviewCount: 42 },
  { sellerId: supplierId, name: "Hybrid Maize Seeds (DK8031)", description: "High-yielding hybrid maize seeds. Drought tolerant. 5kg pack.", category: "farm_inputs", subcategory: "Seeds", price: "28.00", unit: "pack", stock: 500, imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400", location: "Ouagadougou, Burkina Faso", country: "Burkina Faso", isOrganic: 0, isApproved: 1, rating: "4.8", reviewCount: 67 },
  { sellerId: supplierId, name: "Organic Compost Manure", description: "100% organic compost from composted animal waste. Improves soil structure.", category: "farm_inputs", subcategory: "Organic Fertilizers", price: "15.00", unit: "bag", stock: 2000, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", location: "Ouagadougou, Burkina Faso", country: "Burkina Faso", isOrganic: 1, isApproved: 1, rating: "4.4", reviewCount: 28 },
  { sellerId: supplierId, name: "Herbicide (Glyphosate 360SL)", description: "Broad-spectrum systemic herbicide. 1 liter bottle. Controls weeds effectively.", category: "farm_inputs", subcategory: "Pesticides", price: "18.50", unit: "liter", stock: 800, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", location: "Ouagadougou, Burkina Faso", country: "Burkina Faso", isOrganic: 0, isApproved: 1, rating: "4.2", reviewCount: 19 },
  // Machinery (dealer)
  { sellerId: dealerId, name: "Massey Ferguson 385 Tractor", description: "85HP 4WD tractor, excellent for plowing and cultivation. Well-maintained, 2019 model.", category: "machinery", subcategory: "Tractors", price: "28500.00", unit: "unit", stock: 3, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", location: "Kano, Nigeria", country: "Nigeria", isOrganic: 0, isApproved: 1, rating: "4.9", reviewCount: 7 },
  { sellerId: dealerId, name: "Combine Harvester (John Deere S660)", description: "High-capacity combine harvester for wheat, maize, and rice. 2020 model, low hours.", category: "machinery", subcategory: "Harvesters", price: "125000.00", unit: "unit", stock: 1, imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400", location: "Kano, Nigeria", country: "Nigeria", isOrganic: 0, isApproved: 1, rating: "5.0", reviewCount: 3 },
  { sellerId: dealerId, name: "Disc Plow (3-Disc)", description: "Heavy-duty 3-disc plow for primary tillage. Compatible with 60-80HP tractors.", category: "machinery", subcategory: "Plows", price: "1850.00", unit: "unit", stock: 15, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", location: "Kano, Nigeria", country: "Nigeria", isOrganic: 0, isApproved: 1, rating: "4.7", reviewCount: 11 },
  // Tools (dealer)
  { sellerId: dealerId, name: "Knapsack Sprayer (16L)", description: "Manual knapsack sprayer with adjustable nozzle. Ideal for small-scale farming.", category: "tools", subcategory: "Sprayers", price: "35.00", unit: "unit", stock: 200, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", location: "Kano, Nigeria", country: "Nigeria", isOrganic: 0, isApproved: 1, rating: "4.3", reviewCount: 55 },
  { sellerId: dealerId, name: "Irrigation Drip Kit (1 Acre)", description: "Complete drip irrigation system for 1 acre. Includes pipes, emitters, and filters.", category: "tools", subcategory: "Irrigation", price: "320.00", unit: "set", stock: 50, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", location: "Kano, Nigeria", country: "Nigeria", isOrganic: 0, isApproved: 1, rating: "4.6", reviewCount: 22 },
];

const productIds = [];
for (const p of products) {
  try {
    const [result] = await conn.execute(
      `INSERT INTO products (sellerId, name, description, category, subcategory, price, unit, stock, imageUrl, location, country, isOrganic, isApproved, rating, reviewCount, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [p.sellerId, p.name, p.description, p.category, p.subcategory ?? null, p.price, p.unit, p.stock, p.imageUrl ?? null, p.location, p.country, p.isOrganic, p.isApproved, p.rating ?? "0.0", p.reviewCount ?? 0]
    );
    productIds.push(result.insertId);
    console.log(`✅ Created product: ${p.name} ($${p.price}/${p.unit})`);
  } catch (e) {
    console.error(`❌ Error creating product ${p.name}:`, e.message);
  }
}

// ── 3. Create sample orders ───────────────────────────────────────────────────
const sampleOrders = [
  { buyerId: buyerId, totalAmount: "125.50", status: "delivered", paymentMethod: "bank_transfer", deliveryAddress: "12 Market St, Dakar", deliveryCountry: "Senegal", items: [{ productId: productIds[0], sellerId: farmerId, quantity: 20, unitPrice: 2.50 }, { productId: productIds[1], sellerId: farmerId, quantity: 50, unitPrice: 0.80 }] },
  { buyerId: buyerId, totalAmount: "85.00", status: "shipped", paymentMethod: "mobile_money", deliveryAddress: "45 Avenue Cheikh, Dakar", deliveryCountry: "Senegal", items: [{ productId: productIds[5], sellerId: farmerId, quantity: 1, unitPrice: 85.00 }] },
  { buyerId: buyerId, totalAmount: "240.00", status: "pending", paymentMethod: "cash", deliveryAddress: "78 Rue Blanchot, Dakar", deliveryCountry: "Senegal", items: [{ productId: productIds[7], sellerId: supplierId, quantity: 4, unitPrice: 45.00 }, { productId: productIds[8], sellerId: supplierId, quantity: 2, unitPrice: 28.00 }] },
  { buyerId: buyerId, totalAmount: "1850.00", status: "confirmed", paymentMethod: "bank_transfer", deliveryAddress: "12 Market St, Dakar", deliveryCountry: "Senegal", items: [{ productId: productIds[12], sellerId: dealerId, quantity: 1, unitPrice: 1850.00 }] },
];

for (const order of sampleOrders) {
  try {
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (buyerId, totalAmount, status, paymentMethod, deliveryAddress, deliveryCountry, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [order.buyerId, order.totalAmount, order.status, order.paymentMethod, order.deliveryAddress, order.deliveryCountry]
    );
    const orderId = orderResult.insertId;
    for (const item of order.items) {
      if (!item.productId) continue;
      await conn.execute(
        `INSERT INTO order_items (orderId, productId, sellerId, quantity, unitPrice, totalPrice, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [orderId, item.productId, item.sellerId, item.quantity, item.unitPrice.toFixed(2), (item.quantity * item.unitPrice).toFixed(2)]
      );
    }
    console.log(`✅ Created order #${orderId}: $${order.totalAmount} (${order.status})`);
  } catch (e) {
    console.error(`❌ Error creating order:`, e.message);
  }
}

// ── 4. Create logistics services ─────────────────────────────────────────────
const logisticsServices = [
  { providerId: logisticsId, name: "Refrigerated Truck Service", vehicleType: "Refrigerated Truck", capacity: "5 tons", pricePerKm: "2.50", coverageArea: "West Africa" },
  { providerId: logisticsId, name: "Pickup Van Delivery", vehicleType: "Pickup Van", capacity: "1 ton", pricePerKm: "1.20", coverageArea: "Lagos, Nigeria" },
];
for (const s of logisticsServices) {
  try {
    await conn.execute(
      `INSERT INTO logistics_services (providerId, name, vehicleType, capacity, pricePerKm, coverageArea, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [s.providerId, s.name, s.vehicleType, s.capacity, s.pricePerKm, s.coverageArea]
    );
    console.log(`✅ Created logistics: ${s.name}`);
  } catch (e) {
    console.error(`❌ Error creating logistics:`, e.message);
  }
}

// ── 5. Create storage services ────────────────────────────────────────────────
const storageServices = [
  { providerId: storageId, name: "Cold Storage Facility - Johannesburg", location: "Johannesburg, South Africa", capacity: "500 tons", pricePerMonth: "850.00", features: "Temperature-controlled, 24/7 security, fire suppression" },
  { providerId: storageId, name: "Grain Silo - Pretoria", location: "Pretoria, South Africa", capacity: "1000 tons", pricePerMonth: "1200.00", features: "Pest-controlled, humidity monitoring, bulk loading" },
];
for (const s of storageServices) {
  try {
    await conn.execute(
      `INSERT INTO storage_services (providerId, name, location, capacity, pricePerMonth, features, isAvailable, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [s.providerId, s.name, s.location, s.capacity, s.pricePerMonth, s.features]
    );
    console.log(`✅ Created storage: ${s.name}`);
  } catch (e) {
    console.error(`❌ Error creating storage:`, e.message);
  }
}

// ── 6. Create messages ────────────────────────────────────────────────────────
const messages = [
  { senderId: buyerId, receiverId: farmerId, content: "Hello! Are your tomatoes still available? I need 100kg for my restaurant." },
  { senderId: farmerId, receiverId: buyerId, content: "Yes, they are! I can supply 100kg at $2.50/kg. Freshly harvested this week." },
  { senderId: buyerId, receiverId: farmerId, content: "Great! Can you arrange delivery to Dakar?" },
  { senderId: farmerId, receiverId: buyerId, content: "I can work with a logistics partner. Let me connect you with Chidi Okafor." },
  { senderId: buyerId, receiverId: dealerId, content: "I'm interested in the Massey Ferguson tractor. Is it still available?" },
  { senderId: dealerId, receiverId: buyerId, content: "Yes! It's in excellent condition. Would you like to schedule a viewing?" },
];
for (const m of messages) {
  try {
    await conn.execute(
      `INSERT INTO messages (senderId, receiverId, content, isRead, createdAt) VALUES (?, ?, ?, 0, NOW())`,
      [m.senderId, m.receiverId, m.content]
    );
  } catch (e) {
    console.error(`❌ Error creating message:`, e.message);
  }
}
console.log(`✅ Created ${messages.length} sample messages`);

// ── 7. Create notifications ───────────────────────────────────────────────────
const notifications = [
  { userId: buyerId, title: "Order Delivered!", message: "Your order #1 for $125.50 has been delivered successfully.", type: "order" },
  { userId: buyerId, title: "New Message", message: "Kwame Mensah sent you a message about your tomato inquiry.", type: "message" },
  { userId: farmerId, title: "New Order Received!", message: "You have a new order for Organic Tomatoes. Order total: $50.00", type: "order" },
  { userId: farmerId, title: "Product Approved", message: "Your product 'Organic Tomatoes' has been approved and is now live on the marketplace.", type: "system" },
  { userId: dealerId, title: "New Inquiry", message: "Amina Diallo is interested in your Massey Ferguson 385 Tractor.", type: "message" },
  { userId: supplierId, title: "Low Stock Alert", message: "Your NPK Fertilizer stock is running low. Consider restocking.", type: "system" },
];
for (const n of notifications) {
  try {
    await conn.execute(
      `INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (?, ?, ?, ?, 0, NOW())`,
      [n.userId, n.title, n.message, n.type]
    );
  } catch (e) {
    console.error(`❌ Error creating notification:`, e.message);
  }
}
console.log(`✅ Created ${notifications.length} sample notifications`);

// ── 8. Create product reviews ─────────────────────────────────────────────────
if (productIds[0]) {
  try {
    await conn.execute(
      `INSERT INTO product_reviews (productId, userId, rating, comment, createdAt) VALUES (?, ?, 5, 'Excellent quality tomatoes! Very fresh and organic. Will order again.', NOW())`,
      [productIds[0], buyerId]
    );
    await conn.execute(
      `INSERT INTO product_reviews (productId, userId, rating, comment, createdAt) VALUES (?, ?, 4, 'Good quality, arrived fresh. Packaging could be better.', NOW())`,
      [productIds[0], logisticsId]
    );
    console.log("✅ Created product reviews");
  } catch (e) {
    console.error("❌ Error creating reviews:", e.message);
  }
}

// ── 9. Create audit logs ──────────────────────────────────────────────────────
const adminId = userIds["admin"];
const auditLogs = [
  [adminId, "system_init", "system", null, "System initialized with seed data"],
  [adminId, "product_approve", "products", productIds[0], "Approved: Organic Tomatoes"],
  [adminId, "product_approve", "products", productIds[7], "Approved: NPK Fertilizer"],
  [adminId, "product_approve", "products", productIds[11], "Approved: Massey Ferguson 385 Tractor"],
  [farmerId, "user_register", "users", farmerId, "New farmer registered"],
  [buyerId, "order_create", "orders", 1, "Order placed: $125.50"],
];
for (const log of auditLogs) {
  try {
    await conn.execute(
      `INSERT INTO audit_logs (userId, action, entity, entityId, details, createdAt) VALUES (?, ?, ?, ?, ?, NOW())`,
      log
    );
  } catch (e) {
    console.error("❌ Error creating audit log:", e.message);
  }
}
console.log(`✅ Created ${auditLogs.length} audit log entries`);

await conn.end();
console.log("\n🎉 Seed complete! All test accounts and sample data created successfully.");
console.log("\n📋 Test Accounts:");
console.log("  Admin:    admin@afriagrocore.com / admin");
console.log("  Farmer:   farmer@afriagrocore.com / farmer");
console.log("  Buyer:    buyer@afriagrocore.com / buyer");
console.log("  Logistics: logistics@afriagrocore.com / logistics");
console.log("  Storage:  storage@afriagrocore.com / storage");
console.log("  Supplier: supplier@afriagrocore.com / supplier");
console.log("  Dealer:   dealer@afriagrocore.com / dealer");
