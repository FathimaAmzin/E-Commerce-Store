// routes/orderRoutes.js
const express = require("express");
const db = require("../db/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

// POST /api/orders  { shipping_name, shipping_address }
// Converts the current cart into an order, decrements stock, and empties the cart.
router.post("/", (req, res) => {
  const { shipping_name, shipping_address } = req.body;
  if (!shipping_name || !shipping_address) {
    return res.status(400).json({ error: "Shipping name and address are required." });
  }

  const userId = req.session.userId;
  const cartItems = db
    .prepare(
      `SELECT ci.quantity, p.* FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(userId);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(400).json({ error: `Not enough stock for "${item.name}".` });
    }
  }

  const placeOrder = db.transaction(() => {
    const total_cents = cartItems.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);

    const orderResult = db
      .prepare(
        `INSERT INTO orders (user_id, status, total_cents, shipping_name, shipping_address)
         VALUES (?, 'placed', ?, ?, ?)`
      )
      .run(userId, total_cents, shipping_name, shipping_address);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    for (const item of cartItems) {
      insertItem.run(orderId, item.id, item.name, item.price_cents, item.quantity);
      decrementStock.run(item.quantity, item.id);
    }

    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);

    return orderId;
  });

  const orderId = placeOrder();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);

  res.status(201).json({ ...order, items });
});

// GET /api/orders  (order history for the logged-in user)
router.get("/", (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.session.userId);

  const withItems = orders.map((order) => ({
    ...order,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id),
  }));

  res.json(withItems);
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.session.userId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
