import { Loader2 } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <Loader2 className="h-8 w-8 animate-spin text-british-navy mb-2" />
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  )
}

