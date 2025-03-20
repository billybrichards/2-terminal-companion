'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { ErrorBoundary } from '@/components/error-boundary';

export default function HomePage() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Carbon Market Directory
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                    Explore carbon markets, buyers, and projects around the world
                  </p>
                </div>
                <div className="space-x-4">
                  <Link href="/buyer-directory">
                    <Button variant="default">Access Directory</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
          <section className="w-full py-12 md:py-24 bg-gray-50">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">Directory</h3>
                    <p className="text-gray-500 mt-2">Browse our comprehensive directory of carbon market participants.</p>
                    <Link href="/buyer-directory" className="mt-4 inline-block">
                      <Button variant="outline">Explore Directory</Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">News</h3>
                    <p className="text-gray-500 mt-2">Stay updated with the latest developments in carbon markets.</p>
                    <Link href="/news" className="mt-4 inline-block">
                      <Button variant="outline">Read News</Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">Analytics</h3>
                    <p className="text-gray-500 mt-2">Understand market trends with our data-driven insights.</p>
                    <Link href="/analytics" className="mt-4 inline-block">
                      <Button variant="outline">View Analytics</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Carbon Market Directory. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

