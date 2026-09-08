import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login/faculty');
  }

  let permissions: string[] = [];
  try {
    const dbPerms = await prisma.rolePermission.findMany({
      where: { role: user.role },
    });
    permissions = dbPerms.map((p) => p.permissionCode);
  } catch (e) {}

  if (permissions.length === 0) {
    permissions = DEFAULT_ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar userRole={user.role} permissions={permissions} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1536px] mx-auto w-full space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}

