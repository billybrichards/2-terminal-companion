/**
 * Skeleton loader for the page while content is loading
 */
export function PageSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="w-full h-[500px] bg-muted/50"></div>
      <div className="container py-12">
        <div className="w-2/3 h-8 bg-muted/50 mx-auto mb-4 rounded"></div>
        <div className="w-1/2 h-4 bg-muted/50 mx-auto mb-8 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted/50 rounded"></div>
          <div className="h-64 bg-muted/50 rounded"></div>
          <div className="h-64 bg-muted/50 rounded"></div>
        </div>
      </div>
    </div>
  )
}

