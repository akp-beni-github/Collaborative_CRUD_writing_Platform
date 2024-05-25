require('dotenv').config();
const express = require('express');
const argon2 = require('argon2');
const mysql = require('mysql2/promise');
const axios = require('axios');
const app = express();

app.use(express.json());

// Database configuration
const dbConfig = {
    host: 'mysql', // Docker Compose service name
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
};
  
// Create a pool
const pool = mysql.createPool(dbConfig);

// User signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Check if the username already exists
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(409).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await argon2.hash(password);

        // Insert the new user to the database
        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error');
    }
});

// Login-check endpoint (redirects to Auth Server login if valid)
app.post('/login-check', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Retrieve user from the database
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            console.log('User not found');
            return res.status(403).send('User not found');
        }

        const user = rows[0];

        // Check if password is valid
        const validPassword = await argon2.verify(user.password, password);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            console.log('Password incorrect');
            return res.status(403).send('Password incorrect');
        }

        // Forward the request to the Auth Server's login endpoint
        const authServerURL = 'http://auth-server:4000/login'; // Docker Compose service name
        const response = await axios.post(authServerURL, { username, password });
        res.json(response.data);
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Root server running on port 3001');
});
