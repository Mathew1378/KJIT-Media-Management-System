'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, ArrowRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

export interface EventCardProps {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string | null;
  venue: string;
  status: string;
  mediaTeamHead?: string | null;
  thumbnailUrl?: string | null;
  mediaDeadline?: string | null;
}

export default function EventCard({
  id,
  name,
  category,
  startDate,
  endDate,
  venue,
  status,
  mediaTeamHead,
  thumbnailUrl,
  mediaDeadline,
}: EventCardProps) {
  const formattedDate = new Date(startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:border-[#0F2C59]/40">
      <div>
        {/* Large Media Thumbnail Header */}
        <div className="relative h-48 w-full bg-gradient-to-br from-[#0F2C59] to-[#162E4D] overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 space-y-2 p-4">
              <ImageIcon className="w-10 h-10 stroke-[1.5]" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-200/60">
                KJIT Event Media Cover
              </span>
            </div>
          )}

          {/* Top Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#0F2C59]/90 text-white px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
              {category}
            </span>
          </div>

          {/* Status Badge Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors leading-snug line-clamp-2">
            {name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>

            {mediaTeamHead && (
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2 text-slate-500">
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Media Head: {mediaTeamHead}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        {mediaDeadline ? (
          <div className="text-[10.5px] font-bold text-amber-800">
            Deadline: {new Date(mediaDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </div>
        ) : (
          <div className="text-[10.5px] font-bold text-slate-400">Archived Event</div>
        )}

        <Link
          href={`/dashboard/events/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#0F2C59] group-hover:text-amber-600 transition-colors"
        >
          <span>View Event Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
