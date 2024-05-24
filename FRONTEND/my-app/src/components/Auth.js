
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => { //[ data, fucntion ]= usestate(initial value) automatically rendering using STATE
    const [formData, setFormData] = useState({ email: '', password: '' }); //string  
    const [loading, setLoading] = useState(false); //boolean
    const [error, setError] = useState(null); //null or string
    const navigate = useNavigate(); //router

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:3001/signup', formData); //post and wait for apiendpoint response
            if (response.data.success) {
                console.log('User signed up successfully');
                navigate('/secondpage');
            } else {
                setError(response.data.message || 'Signup failed');
            }
        } catch (error) {
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
            const response = await axios.post('http://localhost:3001/login-check', formData);
            if (response.data.success) {
                console.log('User logged in successfully');
                navigate('/secondpage');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (error) {
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
                            name="email"
                            value={formData.email}
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
                            name="email"
                            value={formData.email}
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
