'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Compass, CheckCircle2, Sparkles, X } from 'lucide-react';
import KjitLogo from './KjitLogo';
import ThemeToggle from './ThemeToggle';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventId?: string;
  event?: { id: string; name: string; category: string };
}

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    department: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
          if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, markAll: !id }),
      });

      if (!id) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {}
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-900 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    FACULTY: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-[#0F2C59] dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    MEDIA_HEAD: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    MEDIA_MEMBER: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-900 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    DEAN: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
    HOD: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-900 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    COORDINATOR: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    SOCIAL_MEDIA_HANDLER: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-900 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  };

  const roleBadge = user ? roleColors[user.role] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' } : null;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'KJ';

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100 transition-colors">
      {/* Main Navigation Bar */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between min-h-[5rem] sm:min-h-[5.5rem] gap-4">
        {/* Left Side: Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center group shrink-0 py-1">
          <KjitLogo variant="auto" size="header" layout="full" showSubtitle={true} />
        </Link>

        {/* Right Side: Compact User Profile & Controls */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          {/* Global Theme Control Toggle */}
          <ThemeToggle variant="dropdown" />

          {user ? (
            <>
              {/* Role Badge */}
              {roleBadge && (
                <span
                  className={`hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                >
                  {user.role.replace('_', ' ')}
                </span>
              )}

              {/* Notification Bell & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-[#0F2C59] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                  title="System Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 px-1 py-0.2 min-w-4 h-4 bg-pink-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS DROPDOWN MENU */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400" />
                        <span>System Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-pink-100 text-pink-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={() => handleMarkAsRead()}
                          className="text-[11px] font-bold text-[#0F2C59] dark:text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              handleMarkAsRead(n.id);
                              if (user.role === 'SOCIAL_MEDIA_HANDLER') {
                                router.push('/dashboard/social-media');
                              } else {
                                router.push('/dashboard');
                              }
                              setShowNotifDropdown(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer space-y-1 ${
                              !n.isRead ? 'bg-pink-50/40 dark:bg-pink-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                              <span className="line-clamp-1">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                              {n.message}
                            </p>
                            <div className="text-[9.5px] text-slate-400 pt-0.5">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 text-center border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => setShowNotifDropdown(false)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* User Account / Profile Link */}
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="View Profile & Security Settings"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F2C59] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">{user.name}</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">{user.department}</span>
                </div>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0F2C59] dark:hover:text-blue-400 transition-colors px-3 py-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-[#0F2C59] dark:text-blue-400" />
                Explore Platform
              </Link>
              <Link
                href="/login"
                className="text-xs font-bold bg-[#0F2C59] hover:bg-[#162E4D] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm tracking-wide"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
