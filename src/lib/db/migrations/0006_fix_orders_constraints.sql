-- Migration 0006: Relax legacy strict foreign keys on orders and order_items for modern checkout compatibility

PRAGMA foreign_keys=OFF;

CREATE TABLE orders_new (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_inr INTEGER NOT NULL,
  shipping_address TEXT NOT NULL,
  tracking_number TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  fulfilled_at INTEGER,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  clerk_user_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  subtotal_inr INTEGER,
  shipping_inr INTEGER,
  discount_inr INTEGER DEFAULT 0,
  paid_at INTEGER
);

INSERT INTO orders_new SELECT 
  id, customer_id, status, total_inr, shipping_address, tracking_number, notes, created_at, fulfilled_at,
  razorpay_order_id, razorpay_payment_id, clerk_user_id, customer_name, customer_email, customer_phone,
  subtotal_inr, shipping_inr, discount_inr, paid_at
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

CREATE TABLE order_items_new (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id TEXT,
  product_id TEXT,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_inr INTEGER NOT NULL,
  price_at_purchase INTEGER,
  image_url TEXT
);

INSERT INTO order_items_new SELECT
  id, order_id, variant_id, product_id, product_name, size, color, quantity, price_inr, price_at_purchase, image_url
FROM order_items;

DROP TABLE order_items;
ALTER TABLE order_items_new RENAME TO order_items;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

PRAGMA foreign_keys=ON;
