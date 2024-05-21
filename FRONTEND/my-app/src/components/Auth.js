import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation

const Auth = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/signup', formData);
            if (response.data.success) {
                // Handle successful signup
                console.log('User signed up successfully');
                // Redirect to the second page after successful signup
                navigate('/secondpage');
            } else {
                // Handle signup failure
                console.log('Signup failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', formData);
            if (response.data.success) {
                // Handle successful login
                console.log('User logged in successfully');
                // Redirect to the second page after successful login
                navigate('/secondpage');
            } else {
                // Handle login failure
                console.log('Login failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1>Authentication</h1>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
                <button type="submit">Signup</button>
            </form>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Auth;
