'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  FileCheck,
  HardDrive,
  BarChart3,
  Search,
  Compass,
  Layers,
  CheckSquare,
  Award,
  BookOpen,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import KjitLogo from '@/components/KjitLogo';

export default function LandingPage() {
  const roles = [
    {
      title: 'Administrator',
      roleKey: 'admin',
      route: '/login/admin',
      desc: 'Provision staff accounts, manage system RBAC permissions, inspect audit logs, and enforce security policies.',
      badge: 'System Control',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      title: 'Faculty',
      roleKey: 'faculty',
      route: '/login/faculty',
      desc: 'Register academic events, upload dignitary details, track coverage deadlines, and generate 8-format official reports.',
      badge: 'Event Registration',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      title: 'Media Team Head',
      roleKey: 'media-head',
      route: '/login/media-head',
      desc: 'Oversee department media calendar, assign field coverage personnel, designate event Editor, and monitor Drive folders.',
      badge: 'Media Operations',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Media Team Member',
      roleKey: 'media-member',
      route: '/login/media-member',
      desc: 'Access assigned coverage tasks, upload geotagged photos, raw press images, and compiled video reels.',
      badge: 'Field Coverage',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    },
    {
      title: 'Dean',
      roleKey: 'dean',
      route: '/login/dean',
      desc: 'First-stage formal review of compiled final event reels and department media publications.',
      badge: 'Approval Stage 1',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
    {
      title: 'Head of Department (HOD)',
      roleKey: 'hod',
      route: '/login/hod',
      desc: 'Second-stage review of event media assets, documentation accuracy, and academic compliance.',
      badge: 'Approval Stage 2',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    },
    {
      title: 'Program Coordinator',
      roleKey: 'coordinator',
      route: '/login/coordinator',
      desc: 'Final stage approval for publishing event reels and archiving academic documentation.',
      badge: 'Final Publishing',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0F2C59]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2C59] via-[#162E4D] to-[#0A192F] text-white pt-16 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Editorial Column */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-xs font-extrabold text-[#D4AF37] shadow-xl"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                <span>Kristu Jayanti Institute of Technology • Media Management System</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  Kristu Jayanti University
                  <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-amber-200 to-amber-400 font-serif font-black mt-2">
                    KJIT Media Management System
                  </span>
                </h1>
                <p className="text-amber-200/90 text-sm sm:text-base font-serif italic tracking-wide">
                  "Light & Prosperity • Institutional Excellence in Academic Media Operations"
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl"
              >
                An official internal digital platform for managing departmental events, media coverage, Google Drive v3 cloud archives, 3-stage multi-role approval chains, and dynamic academic reporting for NAAC and UGC compliance.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/login/faculty"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-amber-500/25 flex items-center gap-2"
                >
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#overview"
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 backdrop-blur-md flex items-center gap-2"
                >
                  <span>Explore Platform</span>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium border-t border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Role-Based RBAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Google Drive API v3</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>3-Stage Approvals</span>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card-dark rounded-3xl p-8 border border-amber-400/30 shadow-2xl relative space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <KjitLogo variant="gold" size="lg" layout="full" showSubtitle={true} />
                </div>

                <div className="space-y-4 text-xs text-slate-200">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] block">
                      Institutional Scope
                    </span>
                    <p className="font-semibold text-white leading-snug">
                      School of Computer Science & Technology • Kristu Jayanti Institute of Technology
                    </p>
                    <div className="text-[11px] text-slate-300">
                      Bengaluru • Autonomous Deemed to be University
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Accreditation</span>
                      <span className="text-xs font-black text-amber-300">NAAC A++ Grade</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Storage Engine</span>
                      <span className="text-xs font-black text-emerald-400">Google Drive API v3</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 WEBSITE-LIKE EDITORIAL SECTIONS */}
      <main id="overview" className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* SECTION 01: PLATFORM INTRODUCTION */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59]">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">01</span>
            <span>Platform Introduction</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Centralized Media Operations for Kristu Jayanti Institute of Technology
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                The KJIT Media Management System is an institutional platform created specifically for Kristu Jayanti University's School of Computer Science & Technology. It replaces informal communication with a structured, audited workflow for event registration, media assignment, cloud storage, multi-stage approval, and report generation.
              </p>
            </div>
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">UGC & NAAC Compliance</h4>
                  <p className="text-xs text-slate-500">Formats aligned with university accreditation standards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: EVENT MANAGEMENT */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif text-[#D4AF37]">02</span>
            <span>Event Registration & Scheduling</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
              <Calendar className="w-8 h-8 text-amber-400" />
              <h3 className="text-base font-bold text-white">Guided Step Registration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                6-step event wizard covering title, schedule, venue, dignitaries, participant lists, and media requirements.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
              <Users className="w-8 h-8 text-blue-400" />
              <h3 className="text-base font-bold text-white">Dignitary & Guest Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detailed recording of Chief Guests, Resource Persons, designations, and affiliations.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
              <CheckSquare className="w-8 h-8 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Deadline Enforcement</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatic tracking of coverage deadlines with overdue status alerts for Media Heads.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 03: MEDIA COORDINATION */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59]">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">03</span>
            <span>Media Team Coordination</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900">Photographer, Videographer & Editor Assignment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Media Team Heads assign specific personnel for photography, videography, and final reel editing. Assignments trigger dedicated workspace visibility for team members.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Media Task Hierarchy</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Media Team Head designates event Editor & Field Photographers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Media Members receive task notifications & upload assets</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 04: DIGITAL MEDIA REPOSITORY */}
        <section className="bg-gradient-to-br from-[#0F2C59] via-[#162E4D] to-[#0A192F] text-white rounded-3xl p-8 sm:p-12 border border-blue-900/50 shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif text-[#D4AF37]">04</span>
              <span>Digital Media Repository</span>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Google Drive v3 Backend
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">Section A</span>
              <h4 className="text-base font-bold text-white">Geotagged Photos</h4>
              <p className="text-xs text-slate-300">Images with GPS location metadata for official accreditation press releases.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">Section B</span>
              <h4 className="text-base font-bold text-white">Raw Photos</h4>
              <p className="text-xs text-slate-300">Full resolution unedited photographic archives stored directly in Drive.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">Section C</span>
              <h4 className="text-base font-bold text-white">Final Edited Reel</h4>
              <p className="text-xs text-slate-300">Compiled highlight video reel prepared by assigned Editor for approval.</p>
            </div>
          </div>
        </section>

        {/* SECTION 05: APPROVAL WORKFLOW */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59]">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">05</span>
            <span>Sequential 3-Stage Approval Workflow</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">Stage 01</span>
              <h4 className="text-sm font-black text-slate-900">Dean Review</h4>
              <p className="text-xs text-slate-600">Initial validation of compiled media reel and academic relevance.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-cyan-700 uppercase tracking-wider block">Stage 02</span>
              <h4 className="text-sm font-black text-slate-900">HOD Review</h4>
              <p className="text-xs text-slate-600">Departmental content verification and guest accuracy check.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block">Stage 03</span>
              <h4 className="text-sm font-black text-slate-900">Program Coordinator</h4>
              <p className="text-xs text-slate-600">Final approval for publishing to institutional archives and reports.</p>
            </div>
          </div>
        </section>

        {/* SECTION 06: ACADEMIC REPORT GENERATION */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59]">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">06</span>
            <span>Academic Report Generation</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-2xl font-black text-slate-900">8 Official Institutional Report Formats</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate formal academic documentation with live document previews, print CSS isolation, PDF export, and Word document export. Includes auto-populated metadata, geotagged photo selectors, and interactive student participant lists.
              </p>
            </div>
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-widest">Formats Supported</span>
              <p className="text-xs text-slate-600 font-semibold">
                Seminar, Workshop, Conference, Guest Lecture, Cultural Fest, Tech Fest, FDP, Industrial Visit.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 07: DEPARTMENT MONITORING */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59]">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">07</span>
            <span>Department Monitoring & Metrics</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl font-black text-[#0F2C59]">100%</span>
              <span className="text-xs text-slate-500 block">Drive Cloud Sync</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl font-black text-[#0F2C59]">3-Stage</span>
              <span className="text-xs text-slate-500 block">Approval Chain</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl font-black text-[#0F2C59]">8</span>
              <span className="text-xs text-slate-500 block">Academic Report Types</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl font-black text-[#0F2C59]">7</span>
              <span className="text-xs text-slate-500 block">Role Portals</span>
            </div>
          </div>
        </section>

        {/* SECTION 08: ROLE-BASED ACCESS (PORTAL LAUNCHERS) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#0F2C59] mb-1">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-serif text-[#0F2C59]">08</span>
                <span>Role-Based Access Control</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Select Authorized Role Portal</h2>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              7 Active Roles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, idx) => (
              <motion.div
                key={role.roleKey}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * idx }}
              >
                <Link
                  href={role.route}
                  className="group block h-full bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-[#0F2C59] rounded-2xl p-6 transition-all shadow-sm hover:shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${role.badgeColor}`}>
                        {role.badge}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                      {role.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {role.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-extrabold text-[#0F2C59] group-hover:text-[#D4AF37] flex items-center gap-1.5">
                    <span>Login to {role.title} Portal</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 09: PLATFORM WORKFLOW */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif text-[#D4AF37]">09</span>
            <span>Platform Lifecycle Workflow</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-300 block">Step 01</span>
              <h4 className="text-sm font-bold text-white">Event Registration</h4>
              <p className="text-[11px] text-slate-400">Faculty creates event details and dignitary list.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-300 block">Step 02</span>
              <h4 className="text-sm font-bold text-white">Media Upload</h4>
              <p className="text-[11px] text-slate-400">Media Team uploads geotagged & raw photos to Drive.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-300 block">Step 03</span>
              <h4 className="text-sm font-bold text-white">3-Stage Approval</h4>
              <p className="text-[11px] text-slate-400">Dean &rarr; HOD &rarr; Coordinator validate edited reel.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-300 block">Step 04</span>
              <h4 className="text-sm font-bold text-white">Report Export</h4>
              <p className="text-[11px] text-slate-400">Generate PDF/Word report for academic archives.</p>
            </div>
          </div>
        </section>

        {/* SECTION 10: SIGN IN CTA LAUNCHER */}
        <section className="bg-gradient-to-r from-[#0F2C59] via-[#162E4D] to-[#0A192F] text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden border border-amber-400/20">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block">
              10 • Staff Access Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Access KJIT Media System?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Sign in with your authorized institutional email address to access your role dashboard.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login/faculty"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl font-sans"
              >
                Faculty & Staff Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A192F] text-white py-12 border-t border-blue-900/60 text-xs">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-serif font-black text-sm text-white tracking-wide">
              KRISTU JAYANTI UNIVERSITY (DEEMED TO BE UNIVERSITY)
            </div>
            <div className="text-slate-400 text-[11px]">
              Kristu Jayanti Institute of Technology (KJIT) • School of Computer Science & Technology
            </div>
            <div className="text-amber-300/80 text-[10px] font-semibold">
              K. Narayanapura, Kothanur P.O., Bengaluru - 560077, Karnataka, India
            </div>
          </div>

          <div className="text-slate-400 text-[11px] space-y-1 md:text-right">
            <div>&copy; {new Date().getFullYear()} Kristu Jayanti University. All rights reserved.</div>
            <div className="text-[10px] text-slate-500">Internal Media Management System • Confidential</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
