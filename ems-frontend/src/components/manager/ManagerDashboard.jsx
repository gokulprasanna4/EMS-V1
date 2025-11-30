import React, { useState, useEffect } from 'react';
import { 
    getEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee, 
    getPendingAttendance, 
    updateAttendanceStatus 
} from '../../services/api';
import UserTable from '../../shared/UserTable';
import UserFormModal from '../../shared/UserFormModal';

// Helper to calculate duration in days (inclusive dates)
const getDays = (start, end) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

const ManagerDashboard = () => {
    // --- State Management ---
    const [tab, setTab] = useState('employees'); // 'employees' or 'approvals'
    const [employees, setEmployees] = useState([]); // Stores UserResponse DTOs
    const [requests, setRequests] = useState([]); // Stores AttendanceResponse DTOs
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // --- Data Loading ---
    const loadData = () => {
        getEmployees()
            .then(res => setEmployees(res.data))
            .catch(err => console.error("Failed to load employees", err));

        // Fetches requests (includes username)
        getPendingAttendance()
            .then(res => setRequests(res.data))
            .catch(err => console.error("Failed to load requests", err));
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- CRUD & Approval Handlers ---

    // Handler for Create or Update User (Uses sanitized payload from Modal)
    const handleSaveUser = async (payload) => {
        try {
            if (editingUser) {
                await updateEmployee(editingUser.userId, payload);
                alert("Employee updated successfully");
            } else {
                await createEmployee(payload);
                alert("Employee created successfully");
            }
            setIsModalOpen(false);
            setEditingUser(null);
            loadData(); // Refresh list
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Server Error";
            alert("Operation failed: " + msg);
        }
    };

    // Handler for Delete User
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(id);
                loadData();
            } catch (err) {
                console.log(err);
                
                alert("Failed to delete employee");
            }
        }
    };

    // Handler for Approve/Reject Attendance
    const handleAttendance = async (id, status) => {
        const comment = prompt(`Enter comment for ${status}:`) || "";
        try {
            // API handles encoding of comment and status
            await updateAttendanceStatus(id, status, comment);
            loadData(); // Refresh list
            alert("Status Updated!");
        } catch (err) {
            alert("Failed to update status: " + (err.response?.data || "Check network/server logs."));
        }
    };

    // Open Modal Handlers
    const openCreateModal = () => { setEditingUser(null); setIsModalOpen(true); };
    const openEditModal = (user) => { setEditingUser(user); setIsModalOpen(true); };


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                {tab === 'employees' && (
                    <button 
                        onClick={openCreateModal} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-200"
                    >
                        + Add Employee
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button 
                        onClick={() => setTab('employees')} 
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            tab === 'employees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        My Employees
                    </button>
                    <button 
                        onClick={() => setTab('approvals')} 
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            tab === 'approvals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Attendance Approvals
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            {tab === 'employees' ? (
                // --- Tab 1: Employee Management (Uses DTOs and Table) ---
                <UserTable 
                    users={employees} 
                    onEdit={openEditModal} 
                    onDelete={handleDelete} 
                />
            ) : (
                // --- Tab 2: Attendance Approvals (Shows Username, ID, Days) ---
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                            No pending requests found.
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.requestId} className="bg-white p-4 shadow rounded-lg border-l-4 border-blue-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    {/* Username and ID Display */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {req.username}
                                            <span className="ml-2 text-sm font-normal text-gray-500">(ID: {req.userId})</span>
                                        </h4>
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            {req.status || 'PENDING'}
                                        </span>
                                    </div>
                                    
                                    {/* Dates and Days Calculation */}
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">{req.attendenceType}:</span> {req.startDate} to {req.endDate}
                                        <span className="ml-2 font-bold text-blue-600">
                                            ({getDays(req.startDate, req.endDate)} Days)
                                        </span>
                                    </div>
                                    
                                    {req.userRequestComment && (
                                        <p className="text-sm italic text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                                            Reason: "{req.userRequestComment}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 self-start sm:self-center">
                                    <button 
                                        onClick={() => handleAttendance(req.requestId, 'APPROVED')} 
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm transition duration-150"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAttendance(req.requestId, 'REJECTED')} 
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm transition duration-150"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Reusable Modal for Create/Edit */}
            <UserFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSaveUser} 
                initialData={editingUser} 
                title={editingUser ? "Edit Employee" : "Add New Employee"} 
            />
        </div>
    );
};

export default ManagerDashboard;