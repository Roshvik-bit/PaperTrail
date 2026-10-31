'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Network, GitPullRequest, Flame, Microscope, Cpu, ArrowUpRight } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Compass },
    { href: '/workspace', label: 'Research Workspace', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border group-hover:border-accent/50 flex items-center justify-center transition-colors shadow-inner">
              <Microscope className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-content-primary tracking-tight font-sans">
                  Paper<span className="text-accent">Trail</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-content-secondary hidden sm:block">
                Evidence-Driven Research Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-border">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-elevated text-accent border border-border'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status & action */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-content-secondary">
            <Cpu className="w-3.5 h-3.5 text-secondary" />
            <span>Active Domain:</span>
            <span className="font-medium text-content-primary">Edge AI & SLM</span>
          </div>

          <Link
            href="/workspace"
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover transition-all shadow-sm"
          >
            <span>Launch Engine</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

