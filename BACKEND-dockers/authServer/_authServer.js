// authserver.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

/*
//let refreshTokens = []; // insert store in database

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = { name: username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken, refreshToken });
});

*/


// Database configuration
const dbConfig = {
    host: 'mysql', // Docker Compose service name
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
};

// Create a pool
const pool = mysql.createPool(dbConfig);


// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = { name: username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

    // Store the refresh token in the database
    await storeRefreshToken(refreshToken);

    res.json({ accessToken, refreshToken });
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





/*
// Token generation endpoint
app.post('/token', (req, res) => {
    const { token: refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken });
    });
});*/

// Token generation endpoint
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



/*
// Logout endpoint delete resfreshToken
app.delete('/logout', (req, res) => {
    const { token: refreshToken } = req.body;
    //refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
});*/

// Logout endpoint: Delete refresh token from the database
app.delete('/logout', async (req, res) => {
    const { token: refreshToken } = req.body;
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
