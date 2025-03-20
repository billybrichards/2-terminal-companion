'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center font-bold">
          Carbon Market Directory
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/buyer-directory" className="text-sm font-medium">
            Directory
          </Link>
          <Link href="/news" className="text-sm font-medium">
            News
          </Link>
          <Link href="/analytics" className="text-sm font-medium">
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
}
