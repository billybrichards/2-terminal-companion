import { BuyerDirectory } from "@/components/buyer-directory"
import { fetchBuyers } from "@/lib/supabase"

export default async function BuyerDirectoryPage() {
  // Fetch buyers data from Supabase
  const buyers = await fetchBuyers()
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-british-navy text-white">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-medium text-white">Carbon Market Directory</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <BuyerDirectory initialBuyers={buyers} />
        </div>
      </main>
    </div>
  )
}
