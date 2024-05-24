import React, { useState } from 'react';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';

const SecondPage = () => { 
    const [loading, setLoading] = useState(false); //boolean
    const [error, setError] = useState(null); //null or string
    //const navigate = useNavigate(); //router

    
    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete('/logout');
            if (response.data.success) {
                console.log('User logout successfully');
                //navigate('/');
            } else {
                setError(response.data.message || 'Logout failed');
            }
        } catch (error) {
            setError('Error occurred during login');
        } finally {
            setLoading(false);
        }
    };
      
        return (
          <button onClick={handleLogout}>Logout</button>
        );
      
};

export default SecondPage;

//log out button as for now 
//with cookie authenticateToken if catcherror> back to /root