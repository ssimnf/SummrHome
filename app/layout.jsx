import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'SummrHome — Hyperlocal PG Housing & Student Bazaar',
  description:
    'Find verified student PGs near your neighborhood, connect guardians with PG owners, and buy or sell campus essentials locally.',
  openGraph: {
    title: 'SummrHome — Hyperlocal PG Housing & Student Bazaar',
    description:
      'Find verified student PGs near your neighborhood, connect guardians with PG owners, and buy or sell campus essentials locally.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SummrHome — Hyperlocal PG Housing & Student Bazaar',
    description:
      'Find verified student PGs near your neighborhood, connect guardians with PG owners, and buy or sell campus essentials locally.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900"
      >
        {children}
      </body>
    </html>
  );
}
