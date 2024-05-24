// authserver.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

let refreshTokens = []; // insert store in database

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    /*
    // Dummy user validation for the demo; in a real app, validate against the database
    if (username !== 'testuser' || password !== 'testpass') {
        return res.status(403).send('Username or password incorrect');
    }
    */

    const user = { name: username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken, refreshToken });
});

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
});

// Logout endpoint
app.delete('/logout', (req, res) => {
    const { token: refreshToken } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
});

// Function to generate an access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

// Start the server
app.listen(4000, () => {
    console.log('Auth server running on port 4000');
});
