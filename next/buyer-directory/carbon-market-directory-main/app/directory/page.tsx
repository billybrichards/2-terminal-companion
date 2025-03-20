import { Metadata } from 'next'
import Directory from '@/components/directory/Directory';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Carbon Market Directory',
  description: 'A comprehensive directory of carbon market participants',
}

export default function DirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Directory />
      </main>
    </div>
  );
}

