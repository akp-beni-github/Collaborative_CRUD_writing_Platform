require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');
const argon2 = require('argon2');


app.use(express.json());

app.use(    
    
    cors({ origin: "*",

    })

);

// Database configuration
const dbConfig = {
    host: 'mysql', // Docker Compose service name
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
};

// Create a pool
const pool = mysql.createPool(dbConfig);

app.post('/login', async (req, res) => {
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

        // Generate access token
        const accessToken = generateAccessToken({ name: username });

        // Generate refresh token
        const refreshToken = jwt.sign({ name: username }, process.env.REFRESH_TOKEN_SECRET);

        // Store the refresh token in the database
        await storeRefreshToken(refreshToken);

        // 1 Send tokens in response store in cookie in the frontend
        // res.json({ accessToken, refreshToken });

        // 2 or send in cookie
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, sameSite: 'None' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'None' });


        //res.json({ message: 'Logged in successfully' });
        res.json( { message: 'Logged in successfully -backend' });
        console.log('try sending tokens as cookie');



    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).send('Internal server error');
    }
});


// response back with accessToken, everytime accessToken cookie expired
app.post('/token', async (req, res) => {
    const { token: refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    try {
        // Check if the refresh token exists in the database
        const isTokenValid = await isRefreshTokenValid(refreshToken);
        if (!isTokenValid) return res.sendStatus(403);

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            const accessToken = generateAccessToken({ name: user.name });
            res.json({ accessToken });
        });
    } catch (error) {
        console.error('Error processing token:', error);
        res.status(500).send('Internal server error');
    }
});

// Logout endpoint: Delete refresh token from the database
app.delete('/logout', async (req, res) => {
    const { token: refreshToken } = req.body; //const refreshToken query
    if (!refreshToken) {
        return res.status(400).send('Refresh token is required');
    }

    try {
        // Remove the refresh token from the database
        await removeRefreshToken(refreshToken);
        res.sendStatus(204);
    } catch (error) {
        console.error('Error removing refresh token:', error);
        res.status(500).send('Internal server error');
    }
});

// Function to generate an access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

// Function to store refresh token in the database
async function storeRefreshToken(token) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO refresh_tokens (token) VALUES (?)', [token]);
    } catch (error) {
        console.error('Error storing refresh token:', error);
    } finally {
        connection.release();
    }
}

// Function to remove a refresh token from the database
async function removeRefreshToken(token) {
    const connection = await pool.getConnection();
    try {
        await connection.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    } catch (error) {
        console.error('Error removing refresh token:', error);
        throw error; // Optionally, you can rethrow the error to handle it in the calling function
    } finally {
        connection.release();
    }
}

// Start the server
app.listen(4000, () => {
    console.log('Auth server running on port 4000');
});
