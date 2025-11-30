import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ManagerDashboard from './components/manager/ManagerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
    // Lazy State Init (Fixes Render Loop)
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("currentUser");
        return saved ? JSON.parse(saved) : null;
    });

    const logout = () => { localStorage.removeItem("currentUser"); setCurrentUser(null); };

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
                    <span className="font-bold text-xl">EMS Portal</span>
                    {currentUser && <div className="flex items-center gap-4"><span className="text-sm">{currentUser.user.username} ({currentUser.user.role})</span><button onClick={logout} className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700">Logout</button></div>}
                </nav>
                <main className="py-6">
                    <Routes>
                        <Route path="/login" element={!currentUser ? <Login setUser={setCurrentUser} /> : <Navigate to="/" />} />
                        <Route path="/admin" element={currentUser?.user.role==='ADMIN'?<AdminDashboard/>:<Navigate to="/login"/>} />
                        <Route path="/manager" element={currentUser?.user.role==='MANAGER'?<ManagerDashboard/>:<Navigate to="/login"/>} />
                        <Route path="/employee" element={currentUser?<EmployeeDashboard currentUser={currentUser}/>:<Navigate to="/login"/>} />
                        <Route path="/" element={!currentUser?<Navigate to="/login"/>:currentUser.user.role==='ADMIN'?<Navigate to="/admin"/>:currentUser.user.role==='MANAGER'?<Navigate to="/manager"/>:<Navigate to="/employee"/>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
export default App;