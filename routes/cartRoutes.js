// routes/cartRoutes.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

function getCart(userId) {
  return db
    .prepare(
      `SELECT ci.id as cart_item_id, ci.quantity, p.*
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC`
    )
    .all(userId);
}

// GET /api/cart
router.get("/", (req, res) => {
  const items = getCart(req.session.userId);
  const total_cents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  res.json({ items, total_cents });
});

// POST /api/cart  { product_id, quantity }
router.post("/", (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  if (product.stock < qty) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  const existing = db
    .prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(req.session.userId, product_id);

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?").run(qty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)").run(
      req.session.userId,
      product_id,
      qty
    );
  }

  res.status(201).json(getCart(req.session.userId));
});

// PUT /api/cart/:cartItemId  { quantity }
router.put("/:cartItemId", (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  const item = db
    .prepare("SELECT * FROM cart_items WHERE id = ? AND user_id = ?")
    .get(req.params.cartItemId, req.session.userId);
  if (!item) {
    return res.status(404).json({ error: "Cart item not found." });
  }

  if (qty <= 0) {
    db.prepare("DELETE FROM cart_items WHERE id = ?").run(item.id);
  } else {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(qty, item.id);
  }

  res.json(getCart(req.session.userId));
});

// DELETE /api/cart/:cartItemId
router.delete("/:cartItemId", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(
    req.params.cartItemId,
    req.session.userId
  );
  res.json(getCart(req.session.userId));
});

module.exports = router;
