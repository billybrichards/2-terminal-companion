import Analytics from '@/components/analytics/Analytics';
import Navbar from '@/components/layout/Navbar';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Analytics />
      </main>
    </div>
  );
}

