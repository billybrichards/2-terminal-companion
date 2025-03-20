import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DirectoryNotification() {
  return (
    <Alert className="mb-4 bg-british-lightBlue/20 border-british-navy">
      <Info className="h-4 w-4 text-british-navy" />
      <AlertTitle className="text-british-navy">Carbon Buyer Directory - Private Access</AlertTitle>
      <AlertDescription>
        You are currently viewing the comprehensive Carbon Buyer Directory with direct database access. This version
        provides the most up-to-date information on carbon market buyers and their activities.
      </AlertDescription>
    </Alert>
  )
}

