'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Tag,
  MapPin,
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Grid,
  List,
  Filter,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface CalendarEvent {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  mediaDeadline: string;
  status: string;
  assignments: any[];
}

export default function MediaCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentView, setCurrentView] = useState<'MONTH' | 'WEEK' | 'DAY' | 'AGENDA'>('AGENDA');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
        setLoading(false);
      });
  }, []);

  const categories = ['ALL', 'Academic', 'Workshop', 'Conference', 'Cultural', 'Guest Lecture', 'Sports', 'Extension', 'Executive'];

  const filteredEvents = events.filter(
    (e) => selectedCategory === 'ALL' || e.category.toLowerCase() === selectedCategory.toLowerCase()
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
            <CalendarDays className="w-8 h-8 text-[#0F2C59]" />
            Department Media Schedule & Deadlines
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time institutional schedule of registered academic events, media coverage deadlines, and team assignments.
          </p>
        </div>

        {/* VIEW SELECTOR SWITCH */}
        <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-md flex items-center gap-1 shrink-0">
          {(['MONTH', 'WEEK', 'DAY', 'AGENDA'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                currentView === view
                  ? 'bg-gradient-to-r from-[#0F2C59] to-[#162E4D] text-amber-300 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY FILTER RIBBON */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-700">
          <Filter className="w-4 h-4 text-[#0F2C59]" />
          <span>Category Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CALENDAR DISPLAY */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading department schedule...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-lg">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No scheduled events found for this filter</h3>
          <p className="text-xs text-slate-500">Register new department events to populate the media calendar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const dateObj = new Date(evt.dateTime);
            const deadlineObj = new Date(evt.mediaDeadline);

            return (
              <div
                key={evt.id}
                className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-lg hover:shadow-2xl hover:border-[#0F2C59]/40 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#0F2C59] border border-blue-200 px-3 py-1 rounded-full">
                      {evt.category}
                    </span>
                    <StatusBadge status={evt.status} size="sm" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors leading-snug">
                    <Link href={`/dashboard/events/${evt.id}`}>
                      {evt.name}
                    </Link>
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2 font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CalendarDays className="w-4 h-4 text-[#0F2C59]" />
                      <span>
                        {dateObj.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Deadline: {deadlineObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ({deadlineObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    {evt.assignments?.length || 0} Media Members
                  </span>
                  <Link
                    href={`/dashboard/events/${evt.id}`}
                    className="font-black text-[#0F2C59] hover:text-[#D4AF37] transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
