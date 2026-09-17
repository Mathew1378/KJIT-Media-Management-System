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
    <div className="bg-white rounded-xl p-6 text-slate-900 shadow-sm border border-slate-200 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10.5px] font-bold text-[#0F2C59] uppercase tracking-wider">
            <HardDrive className="w-3.5 h-3.5 text-[#0F2C59]" />
            <span>GOOGLE DRIVE REPOSITORY</span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{eventName}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
              All raw high-resolution event photographs, geotagged press images, and final edited reels are securely archived in the official Kristu Jayanti Google Drive cloud infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <span className="text-slate-400">Folder:</span>
              <span className="font-mono text-[#0F2C59] font-bold">KJIT/{eventName.replace(/[^a-zA-Z0-9]/g, '_')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <span className="text-slate-400">Added By:</span>
              <span className="text-slate-700">{addedBy}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-800 font-bold">{status}</span>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 w-full md:w-auto shrink-0">
          {driveFolderLink ? (
            <>
              <a
                href={driveFolderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F2C59] hover:bg-[#162E4D] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm"
              >
                <span>Open Google Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Folder Link</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-center">
              <span className="text-xs text-slate-500 block font-medium">Drive link pending</span>
              <span className="text-[10px] text-amber-700 font-bold">Will generate upon media upload</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
