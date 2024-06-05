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
const axios = require('axios');

app.use(cookieParser());

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }));

app.use(bodyParser.json());


function authenticateToken(req, res, next) {
    const Atoken = req.cookies['accessToken']; 
    const Rtoken = req.cookies['refreshToken'];

    console.log('refresh /export authen',Rtoken);
    console.log('access /export /authen',Atoken);

    if (!Atoken) {
        console.log('Access token expired');

        // Send POST request to /token with payload of Rtoken
        if (!Rtoken) {
            return res.status(401).send('Refresh token is missing');
        }

        axios.post('http://localhost:4000/token', { token: Rtoken })
            .then(response => {
                const newAccessToken = response.data.accessToken;
                console.log('new access token get from /token',newAccessToken)

                if (newAccessToken) {
                    // Set the new access token in the cookies
                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'None',
                        maxAge: FIFTEEN_MINUTES,
                    });

                    // Proceed with the original request
                    next();
                } else {
                    res.status(401).send('Unable to refresh access token');
                }
            })
            .catch(error => {
                console.error('Error refreshing token:', error);
                res.status(401).send('Refresh token expired or invalid');
            });
    } else {
        // If access token is present, verify it and proceed
        // Assuming you have a function to verify token
        jwt.verify(Atoken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log('Access token invalid');
                return res.status(403).send('Invalid access token');
            }
            req.user = user; // Attach the user to the request
            next(); // Proceed with the original request
        });
    }
}

module.exports = authenticateToken;


app.post('/export', authenticateToken,   async (req, res) => {
    const { content } = req.body;

    try {
        const filePath = './textfile.txt';
        //const fileName = 'download.txt';

        await fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                res.status(500).send('Internal Server Error: ' + err.message); // Sending detailed error message
            } else {
                console.log('File written successfully');
            }
        });
        
        

        // Set the appropriate headers to force a download
        //res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        //res.setHeader('Content-type', 'text/plain'); // Adjust the content type according to your file type

        // Create a read stream from the file and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        //console.log('sending')
        //console.log(res);

    } catch (error) {
        console.error('Error writing to file:', error);
        res.status(500).send('Internal Server Error: ' + error.message); // Sending detailed error message
    }
});


// Start the server
app.listen(4001, () => {
    console.log('Second page API server running on port 4001');
});
