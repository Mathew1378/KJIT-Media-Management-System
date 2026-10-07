'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Building2,
  Users,
  Video,
  ExternalLink,
  Share2,
  Instagram,
  Linkedin,
  AlertCircle,
  Clock,
  Save,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { formatChiefGuest } from '@/lib/dateUtils';

interface MediaAsset {
  id: string;
  fileName: string;
  fileId: string;
  fileType: string;
  drivePath: string;
}

interface ApprovalStep {
  stage: string;
  status: string;
  comments?: string;
  reviewedAt?: string;
  reviewer?: { name: string; role: string };
}

interface Publication {
  id?: string;
  caption?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  instagramPosted?: boolean;
  linkedinPosted?: boolean;
  status?: string;
  postedAt?: string;
}

export interface ApprovedEvent {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  expectedAudience: string;
  dignitariesJson: string;
  chiefGuest?: string;
  specialInstructions?: string;
  createdBy: { name: string; email: string; department: string };
  mediaAssets: MediaAsset[];
  approvalSteps: ApprovalStep[];
  socialMediaPublication?: Publication | null;
}

interface WorkspaceProps {
  event: ApprovedEvent;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SocialMediaWorkspace({ event, onClose, onSaved }: WorkspaceProps) {
  const publication = event.socialMediaPublication || {};

  const [caption, setCaption] = useState<string>(publication.caption || '');
  const [instagramUrl, setInstagramUrl] = useState<string>(publication.instagramUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(publication.linkedinUrl || '');
  const [instagramPosted, setInstagramPosted] = useState<boolean>(
    publication.instagramPosted || Boolean(publication.instagramUrl)
  );
  const [linkedinPosted, setLinkedinPosted] = useState<boolean>(
    publication.linkedinPosted || Boolean(publication.linkedinUrl)
  );

  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [aiInfo, setAiInfo] = useState<{ provider?: string; isAi?: boolean } | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Derive status
  const isIgActive = instagramPosted || instagramUrl.trim().length > 0;
  const isLinkedinActive = linkedinPosted || linkedinUrl.trim().length > 0;
  
  let currentDerivedStatus = 'AWAITING_SOCIAL_MEDIA';
  if (isIgActive && isLinkedinActive) {
    currentDerivedStatus = 'PUBLISHED';
  } else if (isIgActive || isLinkedinActive) {
    currentDerivedStatus = 'PARTIALLY_POSTED';
  }

  // Parse dignitaries
  let dignitaries: { name: string; designation: string; organisation: string }[] = [];
  try {
    dignitaries = JSON.parse(event.dignitariesJson || '[]');
  } catch (e) {}

  const finalReel = event.mediaAssets.find((m) => m.fileType === 'FINAL_REEL') || event.mediaAssets[0];

  const handleGenerateCaption = async () => {
    setGeneratingCaption(true);
    setMsg(null);
    try {
      const res = await fetch('/api/social-media/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to generate AI caption.' });
        setGeneratingCaption(false);
        return;
      }
      setCaption(data.caption);
      setAiInfo({ provider: data.provider, isAi: data.isAiGenerated });
      setGeneratingCaption(false);
    } catch (err) {
      setMsg({ type: 'error', text: 'Error connecting to caption generator.' });
      setGeneratingCaption(false);
    }
  };

  const handleCopyCaption = () => {
    if (!caption) return;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleSavePublication = async () => {
    setSaving(true);
    setMsg(null);

    // URL format checks
    if (instagramUrl.trim()) {
      try {
        new URL(instagramUrl.trim());
      } catch (e) {
        setMsg({ type: 'error', text: 'Invalid Instagram URL format.' });
        setSaving(false);
        return;
      }
    }

    if (linkedinUrl.trim()) {
      try {
        new URL(linkedinUrl.trim());
      } catch (e) {
        setMsg({ type: 'error', text: 'Invalid LinkedIn URL format.' });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/social-media/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          caption,
          instagramUrl: instagramUrl.trim(),
          linkedinUrl: linkedinUrl.trim(),
          instagramPosted: isIgActive,
          linkedinPosted: isLinkedinActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to save publication.' });
        setSaving(false);
        return;
      }

      setMsg({ type: 'success', text: 'Social media publication saved successfully!' });
      setSaving(false);
      if (onSaved) onSaved();
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection error while saving publication.' });
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* WORKSPACE TOP BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-[#0F2C59] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded border border-pink-400/30">
                  Approved Reel Workspace
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Fully Approved
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {event.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {msg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          {/* TWO-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: EVENT DETAILS & APPROVAL PROOF (5 COLS) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Event Metadata Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center justify-between">
                  <span>Structured Event Facts</span>
                  <span className="bg-blue-50 text-[#0F2C59] font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                    {event.category}
                  </span>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400 shrink-0" />
                    <span>
                      {new Date(event.dateTime).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400 shrink-0" />
                    <span>{event.venue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400 shrink-0" />
                    <span>{event.createdBy?.department || 'School of Computer Science & Technology'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400 shrink-0" />
                    <span>Target Audience: {event.expectedAudience}</span>
                  </div>

                  {event.chiefGuest && (
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">Chief Guest:</span>{' '}
                      {formatChiefGuest(event.chiefGuest)}
                    </div>
                  )}

                  {dignitaries.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1">Dignitaries:</span>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400">
                        {dignitaries.map((d, idx) => (
                          <li key={idx}>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{d.name}</span> ({d.designation}, {d.organisation})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.specialInstructions && (
                    <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      "{event.specialInstructions}"
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Approval Chain Proof */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2.5 text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Departmental Approval Chain
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    COMPLETE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="font-bold text-slate-900 dark:text-white">Dean</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Approved
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="font-bold text-slate-900 dark:text-white">HOD</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Approved
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="font-bold text-slate-900 dark:text-white">Coordinator</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Approved
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Reel Media Card */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" /> Approved Final Reel
                </div>

                {finalReel ? (
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold truncate">
                      <span className="truncate">{finalReel.fileName}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        FINAL_REEL
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Path: <span className="font-mono text-[10px]">{finalReel.drivePath || 'KJIT/FinalReel.mp4'}</span>
                    </p>

                    <div className="pt-1">
                      <a
                        href={finalReel.fileId.startsWith('http') ? finalReel.fileId : `https://drive.google.com/file/d/${finalReel.fileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] text-white text-xs font-bold rounded-lg hover:bg-[#162E4D] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View/Download Approved Reel
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-400 italic text-center">No final reel file reference attached.</div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: AI CAPTION GENERATOR & PUBLISHING CONTROLS (7 COLS) */}
            <div className="lg:col-span-7 space-y-5">
              {/* AI Caption Generator Box */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" /> AI Reel Caption Generator
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Generates caption strictly from database verified facts without hallucinating unverified info.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateCaption}
                    disabled={generatingCaption}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingCaption ? 'animate-spin' : ''}`} />
                    {generatingCaption ? 'Generating Caption...' : 'Generate AI Caption'}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Reel Caption (Editable before saving)
                    </label>

                    {caption && (
                      <button
                        onClick={handleCopyCaption}
                        className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedCaption ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={7}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Click 'Generate AI Caption' or type/paste your approved social media caption here..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-600 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                {aiInfo && (
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>Provider: <strong className="uppercase">{aiInfo.provider}</strong></span>
                    <span>{aiInfo.isAi ? '✓ Generated via Gemini AI API' : '✓ Grounded in Verified DB Facts'}</span>
                  </div>
                )}
              </div>

              {/* Social Media Posting Section */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#0F2C59] dark:text-blue-400" /> Social Media Publishing Status
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Post manually to Instagram / LinkedIn and record published URLs.
                    </p>
                  </div>

                  {/* Derived Status Badge */}
                  <div>
                    {currentDerivedStatus === 'PUBLISHED' && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                        PUBLISHED (Both)
                      </span>
                    )}
                    {currentDerivedStatus === 'PARTIALLY_POSTED' && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                        PARTIALLY POSTED (1 Platform)
                      </span>
                    )}
                    {currentDerivedStatus === 'AWAITING_SOCIAL_MEDIA' && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        AWAITING POSTING
                      </span>
                    )}
                  </div>
                </div>

                {/* Platform 1: Instagram */}
                <div className="bg-pink-50/50 dark:bg-pink-950/20 p-4 rounded-xl border border-pink-200/80 dark:border-pink-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-pink-950 dark:text-pink-300 cursor-pointer">
                      <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                      <input
                        type="checkbox"
                        checked={isIgActive}
                        onChange={(e) => setInstagramPosted(e.target.checked)}
                        className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span>Posted to Instagram</span>
                    </label>

                    <span className="text-[10px] text-pink-700 dark:text-pink-400 font-semibold">
                      {isIgActive ? '✓ Posted' : 'Not posted'}
                    </span>
                  </div>

                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      if (e.target.value.trim().length > 0) setInstagramPosted(true);
                    }}
                    placeholder="Paste Instagram Reel URL (e.g. https://www.instagram.com/reel/...)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-pink-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Platform 2: LinkedIn */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-300 cursor-pointer">
                      <Linkedin className="w-4 h-4 text-blue-700 shrink-0" />
                      <input
                        type="checkbox"
                        checked={isLinkedinActive}
                        onChange={(e) => setLinkedinPosted(e.target.checked)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Posted to LinkedIn</span>
                    </label>

                    <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">
                      {isLinkedinActive ? '✓ Posted' : 'Not posted'}
                    </span>
                  </div>

                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      if (e.target.value.trim().length > 0) setLinkedinPosted(true);
                    }}
                    placeholder="Paste LinkedIn Post URL (e.g. https://www.linkedin.com/posts/...)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Action Button Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSavePublication}
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#162E4D] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving Publication...' : 'Save Publication'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
