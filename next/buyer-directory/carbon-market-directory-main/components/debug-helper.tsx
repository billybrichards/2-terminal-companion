"use client"

import { useState } from "react"
import { Bug, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugHelper() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="h-5 w-5 mr-2 text-british-navy" />
            <CardTitle className="text-lg">Debugging Assistant</CardTitle>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        <CardDescription>Troubleshooting steps for loading issues</CardDescription>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Check Browser Console</h3>
              <p className="text-sm text-muted-foreground">
                Open your browser's developer tools (F12 or Right-click > Inspect) and check the Console tab for error
                messages.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Verify Network Requests</h3>
              <p className="text-sm text-muted-foreground">
                In the Network tab, look for failed requests to the Supabase API endpoints.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Test Database Connection</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/test-connection")
                    const result = await response.json()
                    console.log("Connection test result:", result)
                    alert(
                      result.success
                        ? `Connection successful! Found ${result.count} buyers.`
                        : `Connection failed: ${result.error}`,
                    )
                  } catch (error) {
                    console.error("Error testing connection:", error)
                    alert(`Error testing connection: ${error instanceof Error ? error.message : "Unknown error"}`)
                  }
                }}
              >
                Test Database Connection
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

