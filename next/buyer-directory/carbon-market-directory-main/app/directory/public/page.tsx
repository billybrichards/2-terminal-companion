import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BuyerDirectoryPublic } from "@/components/buyer-directory-public"
import { fetchBuyers } from "@/lib/supabase"

export default async function DirectoryPublicPage() {
  // Fetch buyers data from Supabase
  const buyers = await fetchBuyers()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-british-navy text-white">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/directory" className="flex items-center text-white hover:text-british-lightBlue">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <BuyerDirectoryPublic initialBuyers={buyers} />
        </div>
      </main>
    </div>
  )
}

