import type { Metadata } from 'next';
import './globals.css';
import '@xyflow/react/dist/style.css';

export const metadata: Metadata = {
  title: 'PaperTrail — Evidence-Driven Research Intelligence Engine',
  description: 'Discover the connections. Challenge the evidence. Find what to investigate next. Autonomous scientific evidence investigation, research-gap falsification, and experiment feasibility platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-content-primary antialiased selection:bg-accent/20 selection:text-accent">
        {children}
      </body>
    </html>
  );
}

