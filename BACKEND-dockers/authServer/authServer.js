require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');
const argon2 = require('argon2');
const cookieParser = require('cookie-parser');


const ONE_MINUTE = 60000;
const FIFTEEN_MINUTES = ONE_MINUTE * 15;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }));

/*
// Custom middleware to set headers (ensure this is consistent with the CORS settings)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Same as the origin in CORS config
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
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
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: FIFTEEN_MINUTES,
          });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
          });
        
        res.send('Cookies are set');



    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).send('Internal server error');
    }
});


// response back with accessToken, everytime accessToken cookie expired
app.post('/token', async (req, res) => {
    try {
        const token = req.body.token;
        console.log('refreshToken /token : ', token);
        if (token===undefined) { 
            console.log('send 401');
            return res.sendStatus(401); 
        }

        // Check if the refresh token exists in the database
        await isRefreshTokenValid(token);

        console.log('valid refreshtoken')
        console.log('generating access token')

        // Verify the refresh token
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.error('Error verifying refresh token:', err);
                return res.sendStatus(403); // Use return here
            }

        const newaccessToken = generateAccessToken({ name: user.name });
        console.log('newaccessToken', newaccessToken);
        res.json({ accessToken: newaccessToken });
            /*

            //res.json(accessToken);
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: FIFTEEN_MINUTES,
            });
            res.send('Cookies are set'); // Sending this might be redundant after res.json
            return; // Use return here to prevent further execution*/
        });
    
    }   catch (error) {
        console.error('Error processing token:', error);
        res.status(500).send('Internal server error');
    }
});


// Logout endpoint: Delete refresh token from the database and clear cookies
app.delete('/logout', async (req, res) => {
    try {
        // Cookies that have not been signed USING COOKIE_PARSER
        const token = req.cookies.refreshToken;
        console.log('Cookies: ', token);

        // Remove the refresh token from the database
        await removeRefreshToken(token);

        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');

        res.status(204).send({ message: 'Browser cookies cleared' });
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
        await connection.execute('DELETE FROM refresh_tokens WHERE  token = ?', [token]);
    } catch (error) {
        console.error('Error removing refresh token:', error);
        throw error; // Optionally, you can rethrow the error to handle it in the calling function
    } finally {
        connection.release();
    }
}

async function isRefreshTokenValid(token){
    const connection = await pool.getConnection();
    try {
        await connection.execute('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    } catch (error) {
        console.error('Error checking refresh token:', error);
    } finally {
        connection.release();
    }
}

app.listen(4000, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port 4000`);
  });
