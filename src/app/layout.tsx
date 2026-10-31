import type { Metadata } from 'next';
import './globals.css';
import '@xyflow/react/dist/style.css';

export const metadata: Metadata = {
  title: 'PaperTrail — Evidence-Driven Research Intelligence Engine',
  description: 'Discover the connections. Challenge the evidence. Find what to investigate next. Autonomous scientific evidence investigation, research-gap falsification, and experiment feasibility platform.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F7F6F2] text-[#252622] font-sans antialiased selection:bg-[#B96645]/15 selection:text-[#252622] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
