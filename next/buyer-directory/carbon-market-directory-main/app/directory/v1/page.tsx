import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BuyerDirectoryV1 } from "@/components/buyer-directory-v1"

export default function DirectoryV1Page() {
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
          <BuyerDirectoryV1 />
        </div>
      </main>
    </div>
  )
}

