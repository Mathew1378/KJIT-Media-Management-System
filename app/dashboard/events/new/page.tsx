'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Calendar,
  MapPin,
  Users,
  Award,
  FileText,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { getMinDateTimeISTString, isPastIST } from '@/lib/dateUtils';

interface Dignitary {
  name: string;
  designation: string;
  organisation: string;
}

export default function RegisterEventPage() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Academic');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [expectedAudience, setExpectedAudience] = useState('');
  const [chiefGuest, setChiefGuest] = useState({
    name: '',
    designation: '',
    organisation: '',
  });
  const [guestCount, setGuestCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [mediaDeadline, setMediaDeadline] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [dignitaries, setDignitaries] = useState<Dignitary[]>([
    { name: '', designation: '', organisation: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const minDateTimeIST = getMinDateTimeISTString();

  const steps = [
    { number: 1, title: 'Event Information', subtitle: 'Title & Category' },
    { number: 2, title: 'Schedule & Venue', subtitle: 'Date, Time & Location' },
    { number: 3, title: 'Audience Details', subtitle: 'Target Audience' },
    { number: 4, title: 'Visiting Guests', subtitle: 'Chief Guest & Dignitaries' },
    { number: 5, title: 'Media Requirements', subtitle: 'Coverage & Deadlines' },
    { number: 6, title: 'Review & Submit', subtitle: 'Final Authorization' },
  ];

  const addDignitaryRow = () => {
    setDignitaries([...dignitaries, { name: '', designation: '', organisation: '' }]);
  };

  const removeDignitaryRow = (index: number) => {
    if (dignitaries.length === 1) return;
    setDignitaries(dignitaries.filter((_, i) => i !== index));
  };

  const updateDignitary = (index: number, field: keyof Dignitary, value: string) => {
    const updated = [...dignitaries];
    updated[index][field] = value;
    setDignitaries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Client-side validation: disallow past date/time for scheduled event and media deadline (Asia/Kolkata IST)
    if (isPastIST(dateTime)) {
      setError('Event Date & Scheduled Start Time cannot be in the past (IST). Please select a current or future date and time.');
      setSubmitting(false);
      return;
    }

    if (isPastIST(mediaDeadline)) {
      setError('Media Asset Submission Deadline cannot be in the past (IST). Please select a current or future deadline.');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('dateTime', dateTime);
      formData.append('venue', venue);
      formData.append('expectedAudience', expectedAudience);
      formData.append('dignitaries', JSON.stringify(dignitaries.filter((d) => d.name.trim() !== '')));
      formData.append('chiefGuest', JSON.stringify(chiefGuest));
      formData.append('guestCount', String(guestCount));
      formData.append('specialInstructions', specialInstructions);
      formData.append('mediaDeadline', mediaDeadline);
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register event');
        setSubmitting(false);
        return;
      }

      router.push(`/dashboard/events/${data.event.id}`);
    } catch (err: any) {
      setError('Connection error');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Back to Dashboard Overview
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-[#0F2C59]" />
          Register New Department Event
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Guided 6-Step Institutional Registration Wizard for Academic Events & Media Coverage.
        </p>
      </div>

      {/* VISUAL STEP PROGRESS INDICATOR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {steps.map((step) => {
            const isDone = activeStep > step.number;
            const isCurrent = activeStep === step.number;

            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${
                  isCurrent ? 'bg-blue-50/80 border border-blue-200' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0F2C59] text-amber-300 ring-2 ring-amber-400'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${step.number}`}
                </div>

                <div className="hidden sm:block">
                  <div className={`text-xs font-black ${isCurrent ? 'text-[#0F2C59]' : 'text-slate-700'}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{step.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <span>{error}</span>
        </div>
      )}

      {/* STEP FORM PANELS */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-8">
        {/* STEP 1: EVENT INFORMATION */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 1: Event Information</h2>
              <p className="text-xs text-slate-500">Provide official title and select academic event classification</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Event Official Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                  placeholder="e.g. National Symposium on Quantum Computing & Cyber Resilience"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Event Academic Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                >
                  <option value="Academic">Academic Seminar / Symposium</option>
                  <option value="Workshop">Technical Workshop / Hands-on Lab</option>
                  <option value="Conference">National / International Conference</option>
                  <option value="Cultural">Cultural Fest / Extra-Curricular</option>
                  <option value="Guest Lecture">Guest Lecture / Expert Talk</option>
                  <option value="Sports">Sports Meet / Tournament</option>
                  <option value="Extension">Community Extension / Outreach</option>
                  <option value="Executive">Executive Leadership Briefing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SCHEDULE & VENUE */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 2: Schedule & Venue</h2>
              <p className="text-xs text-slate-500">Set date, scheduled start time, and campus venue location</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Event Date & Scheduled Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDateTimeIST}
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Campus Venue / Auditorium <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                  placeholder="e.g. Main Auditorium, SKE Block, Kristu Jayanti Institute of Technology Campus"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: AUDIENCE */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 3: Audience Details</h2>
              <p className="text-xs text-slate-500">Define expected participant capacity and target audience group</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Expected Audience Group & Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expectedAudience}
                onChange={(e) => setExpectedAudience(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                placeholder="e.g. 300 Final Year Computer Science Students & Research Scholars"
              />
            </div>
          </div>
        )}

        {/* STEP 4: GUESTS */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 4: Visiting Guests & Dignitaries</h2>
              <p className="text-xs text-slate-500">Specify Chief Guests and fill visiting dignitaries table</p>
            </div>

            {/* Structured Chief Guest Fields */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#0F2C59] tracking-wider">Chief Guest Details</h3>
                <span className="text-[10px] text-slate-400 font-medium">Structured Name, Designation & Organisation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">Chief Guest Name</label>
                  <input
                    type="text"
                    value={chiefGuest.name}
                    onChange={(e) => setChiefGuest({ ...chiefGuest, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                    placeholder="e.g. Dr. K. Sivan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">Designation</label>
                  <input
                    type="text"
                    value={chiefGuest.designation}
                    onChange={(e) => setChiefGuest({ ...chiefGuest, designation: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                    placeholder="e.g. Former Chairman"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={chiefGuest.organisation}
                    onChange={(e) => setChiefGuest({ ...chiefGuest, organisation: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                    placeholder="e.g. ISRO"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Total Guest Count</label>
              <input
                type="number"
                min={0}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
              />
            </div>

            {/* Dignitaries Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  Dignitaries Table
                </label>
                <button
                  type="button"
                  onClick={addDignitaryRow}
                  className="text-xs font-bold text-[#0F2C59] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0F2C59]" /> Add Dignitary
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Dignitary Name</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Organisation</th>
                      <th className="p-3 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dignitaries.map((d, i) => (
                      <tr key={i}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={d.name}
                            onChange={(e) => updateDignitary(i, 'name', e.target.value)}
                            placeholder="Dr. Jane Smith"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={d.designation}
                            onChange={(e) => updateDignitary(i, 'designation', e.target.value)}
                            placeholder="VP Engineering"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={d.organisation}
                            onChange={(e) => updateDignitary(i, 'organisation', e.target.value)}
                            placeholder="Google India"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeDignitaryRow(i)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: MEDIA REQUIREMENTS */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 5: Media Coverage & Deadlines</h2>
              <p className="text-xs text-slate-500">Set media asset submission deadline, optional event poster, and coverage instructions</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Media Asset Submission Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDateTimeIST}
                  value={mediaDeadline}
                  onChange={(e) => setMediaDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                />
              </div>

              {/* Optional Event Poster Upload Field */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Event Poster <span className="text-slate-400 font-normal">(Optional — image file)</span>
                </label>
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPosterFile(file);
                    }}
                    className="text-xs text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0F2C59] file:text-white hover:file:bg-[#162E4D] file:cursor-pointer"
                  />
                  {posterFile && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {posterFile.name} ({(posterFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Special Coverage Instructions
                </label>
                <textarea
                  rows={4}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                  placeholder="Detail key photo moments (Lamp lighting, Keynote address, Memento presentation) or 4K reel video requirements..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-serif">Step 6: Review & Final Authorization</h2>
              <p className="text-xs text-slate-500">Verify all information before creating event in system database</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Title</span>
                  <span className="font-black text-slate-900 text-sm">{name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Category</span>
                  <span className="font-bold text-[#0F2C59]">{category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Date & Time</span>
                  <span className="font-bold text-slate-800">{dateTime || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Venue</span>
                  <span className="font-bold text-slate-800">{venue || 'Not set'}</span>
                </div>
                {chiefGuest.name && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Chief Guest</span>
                    <span className="font-bold text-slate-800">
                      {chiefGuest.name}
                      {chiefGuest.designation || chiefGuest.organisation
                        ? ` (${[chiefGuest.designation, chiefGuest.organisation].filter(Boolean).join(', ')})`
                        : ''}
                    </span>
                  </div>
                )}
                {posterFile && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Attached Poster</span>
                    <span className="font-bold text-emerald-700">✓ {posterFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION CONTROLS */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-50 transition-colors"
          >
            &larr; Previous Step
          </button>

          {activeStep < 6 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
              className="px-6 py-3 bg-[#0F2C59] hover:bg-[#162E4D] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all font-sans flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting ? 'Registering Event...' : 'Authorize & Submit Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
