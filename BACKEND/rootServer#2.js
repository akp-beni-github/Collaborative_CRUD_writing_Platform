// rootserver.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const axios = require('axios');
const app = express();

app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// User signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Check if the username already exists
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        return res.status(409).send('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user to the database
    await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(201).send('User created successfully');

 
});

// Login-check endpoint (redirects to Auth Server login if valid)
app.post('/login-check', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login-check request:', req.body);

    // Retrieve user from the database
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
        console.log('User not found');
        return res.status(403).send('User not found');
    }

    const user = rows[0];

    // Check if password is valid
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
        console.log('Password incorrect');
        return res.status(403).send('Password incorrect');
    }

    // Forward the request to the Auth Server's login endpoint
    try {
        const response = await axios.post('http://localhost:4000/login', { username, password });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to Auth Server:', error);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : 'Internal server error');
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Root server running on port 3001');
});
