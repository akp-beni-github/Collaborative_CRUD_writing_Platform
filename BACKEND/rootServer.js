// rootserver.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios');
const app = express();

app.use(express.json());

let users = [//demo instead of database
    {
        username: 'user1',
        password: '$2a$10$4RqvZm/KSddahWIKStjhz.XmRq2N7XHaLUk9XIn7pFz60njj9kvP.' // 'password1'
    },
    {
        username: 'user2',
        password: '$2a$10$n2CnNdCxAR6VewboFCZ.tuyvwGmHbEEasgCbWWS.zrGl14gDfGGyK' // 'password2'
    }
];
//signup > insert to database 
//login > select from database
//so the next version of server code gotto have it query to database instead of the users array



// User signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    
    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).send('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Add the new user to the users array
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(201).send('User created successfully');
});



// Login-check endpoint (redirects to Auth Server login if valid)
app.post('/login-check', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login-check request:', req.body);

    const user = users.find(u => u.username === username);
    if (!user) {
        console.log('User not found');
        return res.status(403).send('User not found');
    }

    console.log('User found:', user);

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
