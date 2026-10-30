import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Menú Digital & Comandera KDS',
  description: 'Sistema de comandas y pedidos digitales de alta velocidad',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
