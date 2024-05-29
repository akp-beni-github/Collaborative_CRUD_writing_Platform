import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import Cookies from 'js-cookie'; // Import js-cookie

const Auth = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:3001/signup', formData);
            console.log('Signup response:', response.data);
            if (response.data) {
                console.log('User signed up successfully');
                navigate('/collab-writing-platform');
            } else {
                setError(response.data || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError('Error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:4000/login', formData);
            
            console.log('Login response:', response.data);
            if (response.data) {
                console.log('User logged in successfully -frontend');

                // Store tokens in cookies
                //Cookies.set('accessToken', response.data.accessToken, { secure: true, sameSite: 'None' });
                //Cookies.set('refreshToken', response.data.refreshToken, { secure: true, sameSite: 'None' });

                navigate('/collab-writing-platform');
            } else {
                setError(response.data || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Authentication</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h2>Signup</h2>
                    <form onSubmit={handleSignup}>
                        <input
                            type="email"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                        <button type="submit">Signup</button>
                    </form>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default Auth;
