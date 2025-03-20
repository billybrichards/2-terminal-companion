import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Component for displaying lead statistics
 */
export function LeadsStats() {
  const stats = {
    total: 42,
    active: 18,
    contacted: 15,
    negotiation: 6,
    closed: 3,
  }

  return (
    <Card variant="stats">
      <CardHeader>
        <CardTitle className="text-white">Lead Statistics</CardTitle>
        <CardDescription className="text-british-lightBlue">Overview of your lead pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-british-lightBlue mb-1">Total Leads</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-british-lightBlue mb-1">Active</div>
              <div className="text-xl font-bold text-white">{stats.active}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-british-lightBlue mb-1">Contacted</div>
              <div className="text-xl font-bold text-white">{stats.contacted}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-british-lightBlue mb-1">Negotiation</div>
              <div className="text-xl font-bold text-white">{stats.negotiation}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-british-lightBlue mb-1">Closed</div>
              <div className="text-xl font-bold text-white">{stats.closed}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

