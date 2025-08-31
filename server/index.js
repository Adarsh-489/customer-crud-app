// server/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());             // Allow frontend to communicate
app.use(express.json());     // Parse JSON request bodies

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database');
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// CREATE a new customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number } = req.body;

  // Basic validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;
  const params = [first_name, last_name, phone_number];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: 'Customer created successfully',
      data: { id: this.lastID, first_name, last_name, phone_number }
    });
  });
});


// GET all customers
// GET all customers with optional search & pagination
app.get('/api/customers', (req, res) => {
  let { city, state, pin_code, page, limit } = req.query;

  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : 10;
  const offset = (page - 1) * limit;

  // Base SQL for customers
  let sql = `SELECT c.*, 
                    (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) as address_count
             FROM customers c `;
  let params = [];

  // Filters
  let filters = [];
  if (city) filters.push(`c.id IN (SELECT customer_id FROM addresses WHERE city LIKE ?)`) && params.push(`%${city}%`);
  if (state) filters.push(`c.id IN (SELECT customer_id FROM addresses WHERE state LIKE ?)`) && params.push(`%${state}%`);
  if (pin_code) filters.push(`c.id IN (SELECT customer_id FROM addresses WHERE pin_code LIKE ?)`) && params.push(`%${pin_code}%`);

  if (filters.length > 0) sql += 'WHERE ' + filters.join(' AND ');

  sql += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: 'success',
      data: rows,
      page,
      limit
    });
  });
});



// GET single customer by ID
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;

  // Get customer
  db.get(`SELECT * FROM customers WHERE id = ?`, [id], (err, customer) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Get addresses
    db.all(`SELECT * FROM addresses WHERE customer_id = ?`, [id], (err, addresses) => {
      if (err) return res.status(400).json({ error: err.message });

      // return customer with addresses
      res.json({
        message: 'success',
        data: { ...customer, addresses }
      });
    });
  });
});



// UPDATE a customer by ID
app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;

  // Basic validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`;
  const params = [first_name, last_name, phone_number, id];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({
      message: 'Customer updated successfully',
      data: { id: Number(id), first_name, last_name, phone_number }
    });
  });
});


// DELETE a customer by ID
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `DELETE FROM customers WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});


// CREATE a new address for a specific customer
app.post('/api/customers/:id/addresses', (req, res) => {
  const { id: customer_id } = req.params;
  const { address_details, city, state, pin_code } = req.body;

  // Basic validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`;
  const params = [customer_id, address_details, city, state, pin_code];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: 'Address added successfully',
      data: { id: this.lastID, customer_id, address_details, city, state, pin_code }
    });
  });
});

// GET all addresses for a specific customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const { id: customer_id } = req.params;

  const sql = `SELECT * FROM addresses WHERE customer_id = ?`;
  db.all(sql, [customer_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// UPDATE a specific address by ID
app.put('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const { address_details, city, state, pin_code } = req.body;

  // Basic validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    UPDATE addresses
    SET address_details = ?, city = ?, state = ?, pin_code = ?
    WHERE id = ?
  `;
  const params = [address_details, city, state, pin_code, addressId];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({
      message: 'Address updated successfully',
      data: { id: Number(addressId), address_details, city, state, pin_code }
    });
  });
});

// DELETE a specific address by ID
app.delete('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;

  const sql = `DELETE FROM addresses WHERE id = ?`;
  db.run(sql, [addressId], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  });
});
const path = require('path');

// Serve React frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// For all other routes, serve React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
