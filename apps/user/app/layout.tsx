import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Karyo User Workspace',
  description: 'AI Workspace UI - Command Center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-karyo-dark text-karyo-text min-h-screen">{children}</body>
    </html>
  );
}
