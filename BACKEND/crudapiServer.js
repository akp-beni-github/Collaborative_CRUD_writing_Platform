// secondpageapi.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Example of a protected route
app.post('/create', authenticateToken, (req, res) => {
    res.json({ message: 'create'});
});


// Start the server
app.listen(4001, () => {
    console.log('Second page API server running on port 4001');
});
