'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, CheckCircle2, Trash2, ArrowLeft, ShieldCheck, Film, Camera, AlertCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface MediaMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EventItem {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  status: string;
  assignments: { id: string; roleInEvent: string; user: { id: string; name: string } }[];
}

export default function TeamAssignmentsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [mediaMembers, setMediaMembers] = useState<MediaMember[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Assignment form state for selected event
  const [assignmentsList, setAssignmentsList] = useState<
    { userId: string; roleInEvent: 'PHOTOGRAPHER' | 'VIDEOGRAPHER' | 'EDITOR' }[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // "Register New Member" Modal state
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEDIA_MEMBER');
  const [creatingUser, setCreatingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStaffDirectory = () => {
    fetch('/api/directory')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          const members = data.users.filter((u: any) =>
            ['MEDIA_HEAD', 'MEDIA_MEMBER'].includes(u.role)
          );
          setMediaMembers(members.length > 0 ? members : data.users);
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        }
        setLoading(false);
      });

    fetchStaffDirectory();
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  useEffect(() => {
    if (selectedEvent) {
      const initial = selectedEvent.assignments.map((a) => ({
        userId: a.user.id,
        roleInEvent: a.roleInEvent as any,
      }));
      setAssignmentsList(initial);
    }
  }, [selectedEventId, events]);

  const addAssignmentRow = () => {
    const defaultUserId = mediaMembers.length > 0 ? mediaMembers[0].id : '';
    setAssignmentsList([
      ...assignmentsList,
      { userId: defaultUserId, roleInEvent: 'PHOTOGRAPHER' },
    ]);
  };

  const removeAssignmentRow = (idx: number) => {
    setAssignmentsList(assignmentsList.filter((_, i) => i !== idx));
  };

  const updateAssignment = (idx: number, field: string, value: string) => {
    const copy = [...assignmentsList];
    (copy[idx] as any)[field] = value;
    setAssignmentsList(copy);
  };

  const handleRegisterNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setModalError('');

    try {
      const res = await fetch('/api/assignments/add-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole,
          department: 'Department of Media & Communication',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || 'Failed to register member');
        setCreatingUser(false);
        return;
      }

      const createdUser = data.user;

      // Update media members list
      setMediaMembers((prev) => {
        if (prev.some((m) => m.id === createdUser.id)) return prev;
        return [...prev, createdUser];
      });

      // Automatically append newly registered member to assignments list for selected event
      setAssignmentsList((prev) => [
        ...prev,
        { userId: createdUser.id, roleInEvent: 'PHOTOGRAPHER' },
      ]);

      setMsg(`Registered ${createdUser.name} and added to assignment list!`);
      setNewMemberName('');
      setNewMemberEmail('');
      setShowNewUserModal(false);
      setCreatingUser(false);
    } catch (err: any) {
      setModalError('Server connection error');
      setCreatingUser(false);
    }
  };

  const handleSaveAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch(`/api/events/${selectedEventId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: assignmentsList }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save assignments');
        setSaving(false);
        return;
      }

      setMsg('Media team assignments updated successfully!');
      setSaving(false);

      // Refresh events
      fetch('/api/events')
        .then((res) => res.json())
        .then((d) => {
          if (d.events) setEvents(d.events);
        });
    } catch (err: any) {
      setError('Server error');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-kjit-navy mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-600" />
          Media Team Coverage Assignment Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Assign photographers, videographers, and designate the event Editor responsible for compiling the final reel.
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Select Target Event */}
        {events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Your department hasn't registered any events yet.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-kjit-navy text-white text-xs font-bold rounded-xl shadow hover:bg-kjit-blue transition-colors"
            >
              Register First Event
            </Link>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Department Event to Assign Media Team
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({new Date(evt.dateTime).toLocaleDateString()}) — [{evt.status}]
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <form onSubmit={handleSaveAssignments} className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Assigned Personnel for {selectedEvent.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Designate at least one EDITOR to compile and upload the final reel for Dean approval.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(true)}
                  className="text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-700" /> Register New Person
                </button>

                <button
                  type="button"
                  onClick={addAssignmentRow}
                  className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Member Row
                </button>
              </div>
            </div>

            {assignmentsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                <p>No personnel assigned yet.</p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={addAssignmentRow}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg shadow inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Select Existing Member
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(true)}
                    className="px-3 py-1.5 bg-purple-700 text-white font-bold text-xs rounded-lg shadow inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register New Person
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Select Media Team Staff
                      </label>
                      <select
                        value={item.userId}
                        onChange={(e) => updateAssignment(idx, 'userId', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                      >
                        {mediaMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.email}) [{m.role}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-48">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Role in Event
                      </label>
                      <select
                        value={item.roleInEvent}
                        onChange={(e) => updateAssignment(idx, 'roleInEvent', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-amber-900"
                      >
                        <option value="PHOTOGRAPHER">PHOTOGRAPHER</option>
                        <option value="VIDEOGRAPHER">VIDEOGRAPHER</option>
                        <option value="EDITOR">EDITOR (Final Reel)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAssignmentRow(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 sm:self-end"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {saving ? 'Saving Assignments...' : 'Save Media Team Assignments'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal: Register New Team Member */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" />
                Register New Media Team Member
              </h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleRegisterNewMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  placeholder="alex@kristujayanti.edu.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                >
                  <option value="MEDIA_MEMBER">MEDIA MEMBER (Photographer / Editor)</option>
                  <option value="MEDIA_HEAD">MEDIA TEAM HEAD</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Default login password will be set to <code className="font-mono text-purple-700 font-bold">password123</code>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow"
                >
                  {creatingUser ? 'Registering...' : 'Register & Add to Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
