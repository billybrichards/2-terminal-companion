import Link from "next/link"
import { ArrowLeft, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Header component for the leads page
 */
export function LeadsHeader() {
  return (
    <header className="border-b bg-british-navy text-white">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center text-white hover:text-british-lightBlue">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm" className="bg-british-red text-white hover:bg-british-red/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>
    </header>
  )
}

