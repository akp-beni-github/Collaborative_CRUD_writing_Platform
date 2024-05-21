const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

// Generate JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
    };
    return jwt.sign(payload, 'your_secret_key', { expiresIn: '1h' }); // Token expires in 1 hour
};

// Signup endpoint
app.post('/signup', async (req, res) => {
    // Assuming user registration logic here
    // After successful registration, generate JWT token
    const token = generateToken(newUser); // Assuming newUser is the newly registered user object
    return res.json({ success: true, token });
});

// Login endpoint
app.post('/login', async (req, res) => {
    // Assuming user authentication logic here
    // After successful authentication, generate JWT token
    const token = generateToken(user); // Assuming user is the authenticated user object
    return res.json({ success: true, token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// Protected route
app.get('/protected', verifyToken, (req, res) => {
    // If the token is valid, req.userId contains the user's ID
    return res.json({ success: true, message: 'Access granted' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
