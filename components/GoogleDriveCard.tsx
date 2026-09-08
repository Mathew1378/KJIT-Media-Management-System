'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, HardDrive, ShieldCheck, Folder } from 'lucide-react';

interface GoogleDriveCardProps {
  driveFolderLink?: string | null;
  eventName?: string;
  addedBy?: string;
  date?: string;
  status?: string;
}

export default function GoogleDriveCard({
  driveFolderLink,
  eventName = 'Event Media Folder',
  addedBy = 'Media Operations Team',
  date = 'Current Academic Year',
  status = 'Active & Synced',
}: GoogleDriveCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!driveFolderLink) return;
    navigator.clipboard.writeText(driveFolderLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#0F2C59] via-[#162E4D] to-[#0A192F] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-blue-900/50 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-amber-300">
            <HardDrive className="w-3.5 h-3.5 text-amber-300" />
            <span>GOOGLE DRIVE REPOSITORY</span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Folder className="w-6 h-6 text-amber-400 shrink-0" />
              <span>{eventName}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
              All raw high-resolution event photographs, geotagged press images, and final edited reels are securely archived in the official Kristu Jayanti Google Drive cloud infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <span className="text-slate-400">Folder:</span>
              <span className="font-mono text-amber-200">KJIT/{eventName.replace(/[^a-zA-Z0-9]/g, '_')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <span className="text-slate-400">Added By:</span>
              <span className="text-slate-200">{addedBy}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">{status}</span>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto shrink-0">
          {driveFolderLink ? (
            <>
              <a
                href={driveFolderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-amber-500/25 font-sans"
              >
                <span>Open Google Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>Copy Folder Link</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Drive link pending</span>
              <span className="text-[10px] text-amber-300 font-bold">Will generate upon media upload</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
