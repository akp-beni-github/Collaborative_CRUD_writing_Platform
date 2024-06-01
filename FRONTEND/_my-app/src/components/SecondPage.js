import React, { useState } from 'react';
//import { useCookies } from 'react-cookie';  these are http cookie couldnt be accessed with frontend
//import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecondPage = () => { 
    //const [refresh_cookies] = useCookies(['refreshTokens']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            //let refresh_cookies = Cookies.get();
            //console.log('sending token to server', refresh_cookies);
            const response = await axios.delete('http://localhost:4000/logout', {
                //data: { refresh_cookies },
                withCredentials: true
            });
    
            //console.log('Logout request:', refresh_cookies);
    
            if (response.status === 204) { // Check for status code 204 No Content
                console.log('Refresh token in database is removed');
                console.log('User logged out successfully');

                navigate('/');
            } else {
                console.log('Refresh token in the database aint removed ');
            }
        } catch (error) {
            console.error('Logout error:', error.message);
            setError('Error occurred during logout: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
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
