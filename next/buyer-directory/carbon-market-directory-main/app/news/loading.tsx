import { NewsLoading } from "@/components/news/news-loading"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { NewsHeader } from "@/components/news/news-header"
import { NewsFilters } from "@/components/news/news-filters"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <NewsHeader />
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <NewsFilters />
            </div>
            <div className="md:col-span-3">
              <NewsLoading />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

