// routes/productRoutes.js
const express = require("express");
const db = require("../db/database");

const router = express.Router();

// GET /api/products?category=Ceramics&q=mug
router.get("/", (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY name ASC";

  const products = db.prepare(sql).all(...params);
  res.json(products);
});

// GET /api/products/categories
router.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category ASC").all();
  res.json(rows.map((r) => r.category));
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
});

module.exports = router;
