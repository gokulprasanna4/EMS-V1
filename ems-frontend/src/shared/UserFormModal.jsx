import React, { useState } from 'react';

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
    if (!isOpen) return null;
    return <UserFormContent onClose={onClose} onSubmit={onSubmit} initialData={initialData} title={title} />;
};

const UserFormContent = ({ onClose, onSubmit, initialData, title }) => {
    const [formData, setFormData] = useState({
        username: initialData?.username || '',
        password: '',
        reportingId: initialData?.reportingId || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // SANITIZATION
        const payload = {
            username: formData.username,
            password: (formData.password && formData.password.trim() !== '') ? formData.password : null,
            reportingId: (formData.reportingId && formData.reportingId !== '') ? parseInt(formData.reportingId) : null
        };
        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm">Username</label><input className="w-full border p-2 rounded" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
                    <div><label className="block text-sm">Password</label><input type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                    <div><label className="block text-sm">Report ID</label><input type="number" className="w-full border p-2 rounded" value={formData.reportingId} onChange={e => setFormData({...formData, reportingId: e.target.value})} /></div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button><button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div>
                </form>
            </div>
        </div>
    );
};
export default UserFormModal;