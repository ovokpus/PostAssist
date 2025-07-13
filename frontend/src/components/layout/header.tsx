import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  FileText, 
  Settings, 
  BarChart3, 
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold gradient-text">PostAssist</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/batch"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Batch
            </Link>
            <Link
              href="/status"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Status
            </Link>
            <Link
              href="/verify"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Verify
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/docs" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 md:h-9 md:w-9"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">Documentation</span>
              </Button>
            </Link>
          </div>
          <Link href="/analytics">
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 md:h-9 md:w-9"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="sr-only">Analytics</span>
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 md:h-9 md:w-9"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <Link href="https://github.com/your-repo/PostAssist" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 md:h-9 md:w-9"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <div className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
          <nav className="flex items-center space-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-16 bg-muted animate-pulse rounded" />
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
} 