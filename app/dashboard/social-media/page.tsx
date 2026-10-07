'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Share2,
  CheckCircle2,
  Clock,
  Instagram,
  Linkedin,
  Video,
  Sparkles,
  Calendar,
  MapPin,
  Building2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import SocialMediaWorkspace, { ApprovedEvent } from '@/components/SocialMediaWorkspace';

export default function SocialMediaDashboardPage() {
  const [events, setEvents] = useState<ApprovedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AWAITING' | 'PARTIAL' | 'PUBLISHED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ApprovedEvent | null>(null);

  const fetchApprovedReels = () => {
    setLoading(true);
    fetch('/api/social-media/reels')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovedReels();
  }, []);

  // Compute stat metrics
  const awaitingCount = events.filter(
    (e) => !e.socialMediaPublication || e.socialMediaPublication.status === 'AWAITING_SOCIAL_MEDIA'
  ).length;

  const partialCount = events.filter(
    (e) => e.socialMediaPublication?.status === 'PARTIALLY_POSTED'
  ).length;

  const publishedCount = events.filter(
    (e) => e.socialMediaPublication?.status === 'PUBLISHED'
  ).length;

  // Filter & Search logic
  const filteredEvents = events.filter((evt) => {
    const pubStatus = evt.socialMediaPublication?.status || 'AWAITING_SOCIAL_MEDIA';

    if (activeFilter === 'AWAITING' && pubStatus !== 'AWAITING_SOCIAL_MEDIA') return false;
    if (activeFilter === 'PARTIAL' && pubStatus !== 'PARTIALLY_POSTED') return false;
    if (activeFilter === 'PUBLISHED' && pubStatus !== 'PUBLISHED') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = evt.name.toLowerCase().includes(q);
      const matchCategory = evt.category.toLowerCase().includes(q);
      const matchVenue = evt.venue.toLowerCase().includes(q);
      const matchDept = (evt.createdBy?.department || '').toLowerCase().includes(q);
      return matchName || matchCategory || matchVenue || matchDept;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* INSTITUTIONAL BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-50 border border-pink-200 text-pink-900 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800 text-[10.5px] font-bold uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
            <span>Kristu Jayanti University • Social Media Handler Desk</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Approved Media Reels Publishing Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Access institutionally approved reels, generate AI captions, and publish to official Instagram & LinkedIn channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Role: Social Media Handler
          </span>
        </div>
      </div>

      {/* STATISTIC METRIC CARDS */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-[#0F2C59] dark:text-blue-400" />
            Social Media Publishing Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="AWAITING POSTING"
            value={loading ? '...' : awaitingCount}
            subtitle="Fully approved reels pending publication"
            icon={Clock}
            colorVariant="amber"
          />
          <StatCard
            title="PARTIALLY POSTED"
            value={loading ? '...' : partialCount}
            subtitle="Posted to 1 platform (IG or LinkedIn)"
            icon={Share2}
            colorVariant="navy"
          />
          <StatCard
            title="PUBLISHED"
            value={loading ? '...' : publishedCount}
            subtitle="Posted to both Instagram & LinkedIn"
            icon={CheckCircle2}
            colorVariant="emerald"
          />
        </div>
      </div>

      {/* APPROVED REELS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* FILTER & SEARCH TOOLBAR */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Departmentally Approved Events & Reels</span>
              <span className="text-xs font-normal text-slate-500">({filteredEvents.length} items)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly filtered to events where Dean, HOD, and Programme Coordinator approvals are all complete.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search event name, dept..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0F2C59] w-full sm:w-56 font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-[#0F2C59] dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('AWAITING')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeFilter === 'AWAITING'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Awaiting
              </button>
              <button
                onClick={() => setActiveFilter('PARTIAL')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeFilter === 'PARTIAL'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setActiveFilter('PUBLISHED')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeFilter === 'PUBLISHED'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Published
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT GRID / TABLE */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading approved event reels...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Share2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No approved reels found matching your filter criteria.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Reels will appear here automatically once Dean, HOD, and Programme Coordinator have all completed their approval stage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {filteredEvents.map((evt) => {
              const pub = evt.socialMediaPublication;
              const pubStatus = pub?.status || 'AWAITING_SOCIAL_MEDIA';
              const finalReel = evt.mediaAssets.find((m) => m.fileType === 'FINAL_REEL') || evt.mediaAssets[0];

              return (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0F2C59] dark:hover:border-blue-400 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0F2C59] border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                        {evt.category}
                      </span>

                      {pubStatus === 'PUBLISHED' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          PUBLISHED
                        </span>
                      )}
                      {pubStatus === 'PARTIALLY_POSTED' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          PARTIALLY POSTED
                        </span>
                      )}
                      {pubStatus === 'AWAITING_SOCIAL_MEDIA' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          AWAITING POSTING
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0F2C59] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {evt.name}
                    </h3>

                    {/* Metadata Summary */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(evt.dateTime).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.createdBy?.department || 'CS Dept'}</span>
                      </div>
                    </div>

                    {/* Approval Chain Badge */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> All 3 Approved
                      </span>
                      <span className="text-slate-400">Dean • HOD • Coord</span>
                    </div>

                    {/* Published URL Links Preview */}
                    {(pub?.instagramUrl || pub?.linkedinUrl) && (
                      <div className="space-y-1 pt-1 text-[11px]">
                        {pub.instagramUrl && (
                          <a
                            href={pub.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-semibold hover:underline truncate"
                          >
                            <Instagram className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Instagram Reel Link</span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                          </a>
                        )}

                        {pub.linkedinUrl && (
                          <a
                            href={pub.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold hover:underline truncate"
                          >
                            <Linkedin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">LinkedIn Post Link</span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="w-full mt-4 py-2.5 bg-[#0F2C59] hover:bg-[#162E4D] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Publishing Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WORKSPACE MODAL OVERLAY */}
      {selectedEvent && (
        <SocialMediaWorkspace
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSaved={() => {
            fetchApprovedReels();
          }}
        />
      )}
    </div>
  );
}
