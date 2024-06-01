// loggedin protected api for crudpage
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }));
app.use(bodyParser.json());

// Middleware to authenticate token
function authenticateToken(req, res, next) {  //recieve token as a header from frontend browser 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

let database = [
    { filename: 'ben', txt: 'bennytxt' },
    { filename: 'min', txt: 'minnietxt' }
];

app.get('/files', (req, res) => {
    const filenames = database.map(file => file.filename);
    res.json(filenames);
});

app.get('/file/:filename', (req, res) => {
    const { filename } = req.params;
    const file = database.find(file => file.filename === filename);
    if (file) {
        res.json(file);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Create a new file
app.post('/create', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Filename is required' });
    }
    const existingFile = database.find(file => file.filename === name);
    if (existingFile) {
        return res.status(400).json({ error: 'File already exists' });
    }
    const newFile = { filename: name, txt: '' };
    database.push(newFile);
    res.status(204).send();
});

// Update file content
app.post('/update', (req, res) => {
    const { name, content } = req.body;
    const file = database.find(file => file.filename === name);
    if (file) {
        file.txt = content;
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Delete a file
app.delete('/delete/:filename', (req, res) => {
    const { filename } = req.params;
    const fileIndex = database.findIndex(file => file.filename === filename);
    if (fileIndex > -1) {
        database.splice(fileIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});



// Start the server
app.listen(4001, () => {
    console.log('Second page API server running on port 4001');
});
