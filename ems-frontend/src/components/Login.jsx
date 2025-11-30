import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser({ username, password });
            const userData = res.data;
            localStorage.setItem("currentUser", JSON.stringify(userData));
            setUser(userData);
            if (userData.user.role === 'ADMIN') navigate("/admin");
            else if (userData.user.role === 'MANAGER') navigate("/manager");
            else navigate("/employee");
        } catch (error) { 
            console.log(error);
            
            alert("Invalid Credentials"); }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-center mb-6">EMS Login</h3>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Username</label><input className="w-full border p-2 rounded mt-1" value={username} onChange={e => setUsername(e.target.value)} required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" className="w-full border p-2 rounded mt-1" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Sign In</button>
                </form>
            </div>
        </div>
    );
};
export default Login;