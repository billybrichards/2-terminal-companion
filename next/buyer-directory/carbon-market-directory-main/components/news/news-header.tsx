import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewsHeader() {
  return (
    <div className="bg-british-navy text-white py-6">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carbon Market News</h1>
            <p className="text-british-lightBlue">Latest updates from the carbon market and environmental sectors</p>
          </div>
          <form
            action={async () => {
              "use server"
              // This is a server action that will trigger a revalidation
              // of the page data when the button is clicked
              const { revalidatePath } = await import("next/cache")
              revalidatePath("/news")
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh News
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

