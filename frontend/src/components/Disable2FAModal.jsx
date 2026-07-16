import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Disable2FAModal({ onClose, onConfirm }) {
  const [creds, setCreds] = useState({ email: '', password: '' });

 const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token"); // Token uthaein

  try {
    // Header explicitly yahan bhejein
    await api.post('/auth/disable-2fa', creds, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    toast.success("2FA Disabled & Email sent!");
    onConfirm();
    onClose();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to disable");
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm">
        <h2 className="font-bold mb-4">Confirm to Disable 2FA</h2>
        <input className="input mb-2" placeholder="Email" required onChange={(e) => setCreds({...creds, email: e.target.value})} />
        <input className="input mb-4" type="password" placeholder="Password" required onChange={(e) => setCreds({...creds, password: e.target.value})} />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" className="btn-danger">Disable 2FA</button>
        </div>
      </form>
    </div>
  );
} 