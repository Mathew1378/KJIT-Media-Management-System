'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, CheckCircle2, XCircle, ShieldAlert, ArrowLeft, Building2 } from 'lucide-react';

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

export default function ActiveUserDirectoryPage() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/directory')
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setForbidden(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (forbidden) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 font-serif">Restricted Directory Access</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Faculty members do not have access to the Active User Directory. Please use your Faculty Dashboard to manage events and reports.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2C59] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow transition-colors font-sans"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Back to Dashboard Overview
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-3">
            <Users className="w-8 h-8 text-[#0F2C59]" />
            Active User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department staff directory of provisioned faculty, media team personnel, deans, and administration.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search staff directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none shadow-sm font-medium"
          />
        </div>
      </div>

      {/* DIRECTORY TABLE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 sm:p-7 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F2C59]" /> Active Staff Directory ({filtered.length} Provisioned Accounts)
          </span>
          <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0F2C59] px-3 py-1 rounded-full border border-blue-200">
            RBAC Audited
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 font-medium">Loading user directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 font-medium">No matching staff found in directory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10.5px] font-black">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Institutional Email</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Department / School</th>
                  <th className="px-6 py-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-amber-300 font-serif font-black flex items-center justify-center text-xs shrink-0 shadow">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 font-semibold">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] bg-blue-50 text-[#0F2C59] border border-blue-200 px-3 py-1 rounded-full">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{u.department}</td>
                    <td className="px-6 py-4 text-right">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-extrabold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-extrabold text-[10px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Inactive
                        </span>
                      )}
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
