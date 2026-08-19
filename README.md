# Fieldwork Goods

A simple e-commerce store: a product catalog, shopping cart, order processing,
and user registration/login. Built with **Express.js** (Node) and **SQLite**
(via `better-sqlite3`), with a plain HTML/CSS/JS frontend (no framework/build
step required).

## Features

- Product catalog with search and category filters
- Product detail pages
- Shopping cart (add, update quantity, remove) tied to your account
- Checkout flow that turns a cart into an order, decrements stock, and clears the cart
- Order history page
- User registration and login with hashed passwords and session cookies

## Tech stack

- **Backend:** Node.js, Express, `better-sqlite3`, `bcryptjs`, `express-session`
- **Frontend:** Static HTML/CSS/JS served from `/public`, talking to a JSON REST API
- **Database:** SQLite file (`db/store.db`), created automatically on first run

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Seed the catalog with sample products (safe to re-run)
npm run seed

# 3. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

By default the app runs on port 3000. Set `PORT=xxxx` to use a different port,
and `SESSION_SECRET=some-long-random-string` in production.

## Project structure

```
ecommerce-app/
├── server.js              # Express app entry point
├── db/
│   ├── database.js        # SQLite connection + schema (auto-creates tables)
│   ├── seed.js             # Sample product data
│   └── store.db            # SQLite database file (created on first run)
├── middleware/
│   └── requireAuth.js      # Blocks routes unless a session user is logged in
├── routes/
│   ├── authRoutes.js       # /api/auth/register, /login, /logout, /me
│   ├── productRoutes.js    # /api/products, /api/products/:id
│   ├── cartRoutes.js       # /api/cart (get/add/update/remove)
│   └── orderRoutes.js      # /api/orders (place order, history)
└── public/
    ├── index.html           # Catalog / homepage
    ├── product.html          # Product detail page
    ├── cart.html              # Shopping cart
    ├── checkout.html          # Shipping form + place order
    ├── login.html / register.html
    ├── orders.html            # Order history
    ├── css/style.css          # Design system
    └── js/                    # Page-specific + shared frontend logic
```

## API overview

| Method | Route                  | Description                          | Auth required |
|--------|-------------------------|---------------------------------------|:---:|
| GET    | `/api/products`         | List products (`?category=`, `?q=`)   | No |
| GET    | `/api/products/:id`     | Product detail                        | No |
| GET    | `/api/products/categories` | List distinct categories           | No |
| POST   | `/api/auth/register`    | Create account, starts a session      | No |
| POST   | `/api/auth/login`       | Log in, starts a session              | No |
| POST   | `/api/auth/logout`      | End session                           | Yes |
| GET    | `/api/auth/me`          | Current logged-in user (or `null`)    | No |
| GET    | `/api/cart`             | Current user's cart + total           | Yes |
| POST   | `/api/cart`             | Add item `{ product_id, quantity }`   | Yes |
| PUT    | `/api/cart/:cartItemId` | Update quantity (0 removes it)        | Yes |
| DELETE | `/api/cart/:cartItemId` | Remove item                           | Yes |
| POST   | `/api/orders`           | Place order from cart (`{ shipping_name, shipping_address }`) | Yes |
| GET    | `/api/orders`           | Order history                         | Yes |
| GET    | `/api/orders/:id`       | Single order detail                   | Yes |

## Notes on design decisions

- **SQLite over a heavier DB:** zero setup, single file, easy to inspect —
  a good fit for a small store. Swapping to Postgres/MySQL later mainly means
  replacing `db/database.js` and the SQL calls in `routes/`.
- **Sessions over JWT:** simpler to reason about for a server-rendered-static
  + REST hybrid like this, and cookies are `httpOnly` by default.
- **Stock is checked twice:** once when adding to cart, once again at checkout
  (transactionally, alongside decrementing stock) to avoid overselling if two
  people buy the last item at once.

## Extending it

- Add product images by replacing `image_emoji` with a real `image_url` column.
- Add an admin role + routes for managing inventory.
- Add pagination to `/api/products` once the catalog grows.
- Swap `better-sqlite3` for `pg` and adjust queries to move to Postgres.
