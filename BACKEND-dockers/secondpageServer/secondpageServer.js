// loggedin protected api for collabwritingpage
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); 
const fsPromises = fs.promises; 
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }));

app.use(bodyParser.json());

/* Middleware to authenticate token
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
*/
function authenticateToken(req, res, next) {
    const token = req.cookies['accessToken']; 
    console.log(token);
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken; // Exporting the middleware function

app.post('/export', authenticateToken,  async (req, res) => {
    const { content } = req.body;

    try {
        const filePath = './textfile.txt';
        const fileName = 'download.txt';

        await fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                res.status(500).send('Internal Server Error: ' + err.message); // Sending detailed error message
            } else {
                console.log('File written successfully');
            }
        });
        
        

        // Set the appropriate headers to force a download
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', 'text/plain'); // Adjust the content type according to your file type

        // Create a read stream from the file and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error writing to file:', error);
        res.status(500).send('Internal Server Error: ' + error.message); // Sending detailed error message
    }
});


// Start the server
app.listen(4001, () => {
    console.log('Second page API server running on port 4001');
});
