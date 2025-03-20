import Link from "next/link"
import { ArrowLeft, Database } from "lucide-react"
import { PrivateDirectory } from "@/components/private-directory"
import { fetchBuyers } from "@/lib/supabase"
export default async function PrivateDirectoryPage() {
  // Fetch buyers data from Supabase
  const buyers = await fetchBuyers()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-british-navy text-white">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/buyer-directory" className="flex items-center text-white hover:text-british-lightBlue">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
          <div className="ml-auto flex items-center gap-2">
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <PrivateDirectory initialBuyers={buyers} />
        </div>
      </main>
    </div>
  )
}

