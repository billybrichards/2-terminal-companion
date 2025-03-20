import Link from "next/link"
import { Globe } from "lucide-react"
import { ChangeblockLogo } from "@/components/changeblock-logo"

/**
 * Site footer component
 */
export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Globe className="h-6 w-6 text-british-navy" />
          <p className="text-center text-sm leading-loose md:text-left">© 2024 CarbonConnect. All rights reserved.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Terms
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </Link>
          <span className="text-sm text-muted-foreground flex items-center">
            Powered by{" "}
            <a href="#" className="ml-1 hover:underline">
              <ChangeblockLogo />
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

