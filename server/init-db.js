// server/init-db.js
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (creates database.db if it doesn't exist)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON;`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE
  );`);

  // Addresses table
  db.run(`CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    address_details TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );`);
});

db.close();
console.log('Database initialized successfully');
