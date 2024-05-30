import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecondPage = () => { 
    //initialize 
    const [loading, setLoading] = useState(false); // boolean to track loading state
    const [error, setError] = useState(null); // null or string for error messages
    const navigate = useNavigate(); 

    /*
    // ??????Function to check token expiration on the frontend
    function isTokenExpired(token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp < Date.now() / 1000;
    }
    const browsers_accessToken = Cookies.get('accessToken');
    if (isTokenExpired(browsers_accessToken)) {
    // Handle token refresh or redirect to login
    } ทีละเรื่อง logout ก่อน แล้วค่อย accesstoken expire
    */


    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let browsers_refreshToken = Cookies.get('refreshToken');
            if (!browsers_refreshToken) {
                throw new Error('Refresh token not found');
            }
            const response = await axios.delete('http://localhost:4000/logout',  {
                data: { token: browsers_refreshToken } 
            });
            console.log('Login request:', browsers_refreshToken);
            console.log('Login response:', response.data);
            if (response.data) {
                console.log('refreshToken in database is removed');//remove from database
    
                Cookies.remove('refreshToken'); // remove browser cookie
                console.log('User logged out successfully');
                navigate('/');
            } else {
                console.log('cannot connect to logout api and remove refreshtoken from database');
            }
        } catch (error) {
            setError('Error occurred during logout: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    

    //send 
    
    return (
        <div>
            <button onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default SecondPage;
