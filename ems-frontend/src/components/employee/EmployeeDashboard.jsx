import React, { useState, useEffect } from 'react';
import { applyAttendance, submitFeedback, submitInfoRequest, getMyAttendance, checkAppliedDates } from '../../services/api';

// Helper to calculate duration in days
const getDays = (start, end) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

const EmployeeDashboard = ({ currentUser }) => {
    const uid = currentUser.user.userId;
    const [history, setHistory] = useState([]);
    
    // Forms State
    const [att, setAtt] = useState({ attendenceType: 'ATTENDENCE', startDate: '', endDate: '', userRequestComment: '' });
    const [feed, setFeed] = useState('');
    const [info, setInfo] = useState({ requestType: '', requestDescription: '' });

    // Status State
    const [appliedStatus, setAppliedStatus] = useState(null); // null, 'checking', 'applied'

    // Load History
    const loadHistory = () => getMyAttendance(uid).then(res => setHistory(res.data));
    useEffect(() => { loadHistory(); }, [uid]);

    // --- FIXED USE EFFECT FOR DATE CHECK ---
    useEffect(() => {
        let isActive = true; // Flag to prevent setting state on unmounted component

        if (att.startDate && att.endDate) {
            // FIX: Wrap the initial state update in setTimeout(..., 0)
            // This moves the update to the end of the event loop, fixing the linter error.
            const timer = setTimeout(() => {
                if (isActive) setAppliedStatus('checking');

                checkAppliedDates(uid, att.startDate, att.endDate)
                    .then(res => {
                        if (isActive) {
                            setAppliedStatus(res.data === true ? 'applied' : null);
                        }
                    })
                    .catch(() => {
                        if (isActive) setAppliedStatus(null);
                    });
            }, 0);

            // Cleanup function
            return () => {
                isActive = false;
                clearTimeout(timer);
            };
        } else {
            setAppliedStatus(null);
        }
    }, [att.startDate, att.endDate, uid]);

    // --- Handlers ---

    const handleApply = (e) => { 
        e.preventDefault(); 
        
        if (appliedStatus === 'applied') {
            alert("🛑 You already have a request covering these dates.");
            return;
        }
        if (appliedStatus === 'checking') {
            alert("Please wait for date validation.");
            return;
        }

        applyAttendance(uid, att).then(() => { 
            alert("Submitted Successfully!"); 
            loadHistory(); 
            // Reset form
            setAtt({ attendenceType: 'ATTENDENCE', startDate: '', endDate: '', userRequestComment: '' }); 
        }).catch(error => {
             alert('Submission Failed: ' + (error.response?.data || 'Server error.'));
        }); 
    };

    const handleFeedback = (e) => { e.preventDefault(); submitFeedback(uid, { feedback: feed }).then(() => { alert("Feedback Sent!"); setFeed(''); }); };
    const handleInfo = (e) => { e.preventDefault(); submitInfoRequest(uid, info).then(() => { alert("Info Request Sent!"); setInfo({requestType:'', requestDescription:''}); }); };

    // Helper for Status Color
    const getStatusColor = (status) => {
        if (status === 'APPROVED') return 'bg-green-500 text-white';
        if (status === 'REJECTED') return 'bg-red-500 text-white';
        return 'bg-yellow-500 text-white';
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                
                {/* 1. Apply Attendance Form */}
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Apply Leave / Attendance</h3>
                    <form onSubmit={handleApply} className="space-y-3">
                        <select className="w-full border p-2 rounded" value={att.attendenceType} onChange={e => setAtt({...att, attendenceType: e.target.value})} required>
                            <option value="ATTENDENCE">Attendance</option><option value="LEAVE">Leave</option>
                        </select>
                        <div className="flex gap-2">
                            <input type="date" className="w-full border p-2 rounded" value={att.startDate} onChange={e => setAtt({...att, startDate: e.target.value})} required />
                            <input type="date" className="w-full border p-2 rounded" value={att.endDate} onChange={e => setAtt({...att, endDate: e.target.value})} required />
                        </div>
                        
                        {/* Status Message Display */}
                        {appliedStatus === 'applied' && (
                            <p className="p-2 text-sm text-red-700 bg-red-100 rounded font-medium border border-red-300">
                                🛑 Conflict: A request already exists for this date range.
                            </p>
                        )}
                        {appliedStatus === 'checking' && (
                            <p className="p-2 text-sm text-yellow-700 bg-yellow-100 rounded font-medium border border-yellow-300">
                                Validating dates...
                            </p>
                        )}

                        <input className="w-full border p-2 rounded" placeholder="Reason" value={att.userRequestComment} onChange={e => setAtt({...att, userRequestComment: e.target.value})} />
                        
                        <button className={`w-full p-2 rounded text-white font-bold transition ${appliedStatus === 'applied' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={appliedStatus === 'applied' || appliedStatus === 'checking'}>
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* 2. Info Request Form */}
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Request Info</h3>
                    <form onSubmit={handleInfo} className="space-y-3">
                        <input className="w-full border p-2 rounded" placeholder="Type (e.g. Salary Slip)" value={info.requestType} onChange={e => setInfo({...info, requestType: e.target.value})} required />
                        <textarea className="w-full border p-2 rounded" placeholder="Description" value={info.requestDescription} onChange={e => setInfo({...info, requestDescription: e.target.value})} required />
                        <button className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Request</button>
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                {/* 3. Feedback Form */}
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Submit Feedback</h3>
                    <form onSubmit={handleFeedback} className="space-y-3">
                        <textarea className="w-full border p-2 rounded" placeholder="Your feedback..." value={feed} onChange={e => setFeed(e.target.value)} required />
                        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Send Feedback</button>
                    </form>
                </div>

                {/* 4. History */}
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">My Requests History</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {history.length === 0 && <p className="text-gray-500 text-sm">No history found.</p>}
                        {history.map(h => (
                            <div key={h.requestId} className="border p-3 rounded text-sm bg-gray-50">
                                <div className="flex justify-between font-bold items-center">
                                    <span className="text-gray-700">{h.attendenceType}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(h.status)}`}>
                                        {h.status || 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-1 text-gray-600">
                                    <span>{h.startDate} - {h.endDate}</span>
                                    <span className="font-semibold text-blue-600 ml-2">({getDays(h.startDate, h.endDate)} Days)</span>
                                </div>
                                {h.managerComment && <div className="text-xs text-indigo-600 mt-1 font-semibold">Manager Note: {h.managerComment}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;