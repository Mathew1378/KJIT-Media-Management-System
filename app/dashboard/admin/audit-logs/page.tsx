'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, UserCheck } from 'lucide-react';

interface AuditLogItem {
  id: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.auditLogs) setLogs(data.auditLogs);
        setLoading(false);
      });
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      (l.userName && l.userName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-700" />
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking of user authentication, event registration, media uploads, and approval chain actions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audit actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
          <span>Total Log Entries ({filtered.length})</span>
          <span className="text-[11px] text-slate-400 font-mono">127.0.0.1 Protection Active</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No matching audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Audit Details</th>
                  <th className="px-5 py-3.5 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">{log.userName || 'System'}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                        {log.role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-kjit-navy">{log.action}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-md">{log.details}</td>
                    <td className="px-5 py-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
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
