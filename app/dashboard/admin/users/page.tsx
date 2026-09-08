'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, ShieldCheck, Mail, User as UserIcon, Building2, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FACULTY');
  const [department, setDepartment] = useState('School of Computer Science & Technology');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      setMsg(`User account created successfully for ${name} (${role})`);
      setName('');
      setEmail('');
      setPassword('password123');
      setSubmitting(false);
      fetchUsers();
    } catch (err: any) {
      setError('Server error');
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (e) {}
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-purple-700" />
          User Provisioning & Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Every user in the system is provisioned by an Administrator. There is no self-signup.
        </p>
      </div>

      {/* Provision New User Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          Provision New Account
        </h2>

        {msg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-medium">
            {msg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              placeholder="Dr. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              placeholder="johndoe@kristujayanti.edu.in"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
            >
              <option value="ADMIN">ADMIN (System Control)</option>
              <option value="FACULTY">FACULTY (Event Creator)</option>
              <option value="MEDIA_HEAD">MEDIA HEAD (Operations Lead)</option>
              <option value="MEDIA_MEMBER">MEDIA MEMBER (Photographer/Editor)</option>
              <option value="DEAN">DEAN (Approval Stage 1)</option>
              <option value="HOD">HOD (Approval Stage 2)</option>
              <option value="COORDINATOR">PROGRAM COORDINATOR (Final Stage)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Provisioning...' : 'Provision User Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Provisioned Accounts Directory</h2>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
            {users.length} Total Users
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">User Name</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{u.name}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{u.department}</td>
                    <td className="px-5 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
