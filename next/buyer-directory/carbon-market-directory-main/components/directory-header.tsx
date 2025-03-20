import Link from "next/link"
import { Globe, BarChart3, Database, User, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DirectoryHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-british-navy text-white">
      <Link className="flex items-center justify-center" href="/">
        <Globe className="h-6 w-6 text-white" />
        <span className="ml-2 text-xl font-bold text-white">CarbonConnect</span>
      </Link>

      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="/">
          <Database className="inline-block mr-1 h-4 w-4" />
          Directory
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="/news">
          <Newspaper className="inline-block mr-1 h-4 w-4" />
          News
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="/analytics">
          <BarChart3 className="inline-block mr-1 h-4 w-4" />
          Analytics
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

