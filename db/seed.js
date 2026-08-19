// db/seed.js
const db = require("./database");

const products = [
  { sku: "FW-CER-001", name: "Stoneware Coffee Mug", category: "Ceramics", description: "Hand-thrown stoneware mug with a matte glaze. Holds 12oz.", price_cents: 245000, stock: 42, image_emoji: "☕" },
  { sku: "FW-CER-002", name: "Speckled Dinner Bowl", category: "Ceramics", description: "Wide stoneware bowl for everyday meals. Dishwasher safe.", price_cents: 320000, stock: 30, image_emoji: "🥣" },
  { sku: "FW-CAN-001", name: "Waxed Canvas Tote", category: "Bags", description: "12oz waxed canvas tote with leather straps. Water resistant.", price_cents: 585000, stock: 25, image_emoji: "👜" },
  { sku: "FW-CAN-002", name: "Rolltop Canvas Backpack", category: "Bags", description: "22L rolltop backpack with brass hardware and padded straps.", price_cents: 1250000, stock: 18, image_emoji: "🎒" },
  { sku: "FW-WOOD-001", name: "Walnut Cutting Board", category: "Woodenware", description: "Solid walnut end-grain board, finished with food-safe oil.", price_cents: 740000, stock: 20, image_emoji: "🪵" },
  { sku: "FW-WOOD-002", name: "Beechwood Spoon Set", category: "Woodenware", description: "Set of 3 hand-carved beechwood cooking spoons.", price_cents: 195000, stock: 50, image_emoji: "🥄" },
  { sku: "FW-GDN-001", name: "Forged Hand Trowel", category: "Garden Tools", description: "Full-tang carbon steel trowel with an ash handle.", price_cents: 310000, stock: 35, image_emoji: "🌱" },
  { sku: "FW-GDN-002", name: "Canvas Garden Apron", category: "Garden Tools", description: "Heavy-duty apron with tool pockets and adjustable straps.", price_cents: 450000, stock: 22, image_emoji: "🧤" },
  { sku: "FW-TXT-001", name: "Wool Throw Blanket", category: "Textiles", description: "Lambswool throw, woven in a herringbone pattern. 50x70in.", price_cents: 890000, stock: 15, image_emoji: "🧶" },
  { sku: "FW-TXT-002", name: "Linen Napkin Set", category: "Textiles", description: "Set of 4 stonewashed linen napkins in oat.", price_cents: 280000, stock: 40, image_emoji: "🧵" },
  { sku: "FW-CER-003", name: "Pour-Over Ceramic Dripper", category: "Ceramics", description: "Single-cup ceramic coffee dripper with a walnut collar.", price_cents: 360000, stock: 28, image_emoji: "🫖" },
  { sku: "FW-LEA-001", name: "Leather Notebook Cover", category: "Paper Goods", description: "Vegetable-tanned leather cover fits A5 notebooks.", price_cents: 420000, stock: 33, image_emoji: "📓" },
];

const upsert = db.prepare(`
  INSERT INTO products (sku, name, description, category, price_cents, stock, image_emoji)
  VALUES (@sku, @name, @description, @category, @price_cents, @stock, @image_emoji)
  ON CONFLICT(sku) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    price_cents = excluded.price_cents,
    stock = excluded.stock,
    image_emoji = excluded.image_emoji
`);

const runSeed = db.transaction((rows) => {
  for (const row of rows) upsert.run(row);
});

runSeed(products);

console.log(`Seed complete with Sri Lankan Rupee pricing. Products: ${db.prepare("SELECT COUNT(*) c FROM products").get().c}`);
