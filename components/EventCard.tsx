'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight, Image as ImageIcon } from 'lucide-react';
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
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between hover:border-[#0F2C59]/40">
      <div>
        {/* Media Thumbnail Header */}
        <div className="relative h-40 w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1.5 p-4 bg-slate-50">
              <ImageIcon className="w-8 h-8 stroke-[1.5] text-slate-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                Kristu Jayanti Institute of Technology Event Media Cover
              </span>
            </div>
          )}

          {/* Top Category Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[9.5px] font-bold uppercase tracking-wider bg-[#0F2C59] text-white px-2.5 py-0.5 rounded shadow-sm">
              {category}
            </span>
          </div>

          {/* Status Badge Top Right */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors leading-snug line-clamp-2">
            {name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F2C59] shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>

            {mediaTeamHead && (
              <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2 text-slate-500 text-[11px]">
                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Media Head: {mediaTeamHead}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        {mediaDeadline ? (
          <div className="text-[10px] font-bold text-amber-800">
            Deadline: {new Date(mediaDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </div>
        ) : (
          <div className="text-[10px] font-medium text-slate-400">Archived Event</div>
        )}

        <Link
          href={`/dashboard/events/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2C59] hover:underline transition-colors"
        >
          <span>View Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
