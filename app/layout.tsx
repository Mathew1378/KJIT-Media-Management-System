import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kristu Jayanti Institute of Technology • Media Management Portal',
  description: 'Private, role-based media management web application for Kristu Jayanti Institute of Technology (KJIT).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
