/**
 * News Page
 *
 * This page displays news items from various RSS feeds related to carbon markets
 * and environmental topics. It uses server components for data fetching and
 * client components for interactivity.
 *
 * @route /news
 */

import News from '@/components/news/News';
import Navbar from '@/components/layout/Navbar';

// Revalidate the page every hour to get fresh news
export const revalidate = 3600 // seconds

/**
 * News page component
 *
 * @returns JSX.Element
 */
export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <News />
      </main>
    </div>
  );
}

