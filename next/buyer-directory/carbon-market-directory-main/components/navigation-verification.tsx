"use client"

import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NavigationVerification() {
  const [isOpen, setIsOpen] = useState(false)
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean>>({})

  const verifyNavigation = async () => {
    const results: Record<string, boolean> = {}

    // Test navigation to directory
    try {
      const directoryRes = await fetch("/directory")
      results["directory"] = directoryRes.ok
    } catch (error) {
      results["directory"] = false
    }

    // Add more navigation tests as needed

    setVerificationResults(results)
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Navigation Verification</CardTitle>
        <CardDescription>Verify that all navigation links are working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            verifyNavigation()
            setIsOpen(true)
          }}
        >
          Verify Navigation
        </Button>

        {isOpen && Object.keys(verificationResults).length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Results:</h3>
            <ul className="space-y-1">
              {Object.entries(verificationResults).map(([route, success]) => (
                <li key={route} className="flex items-center">
                  {success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-british-red mr-2" />
                  )}
                  <span>
                    {route}: {success ? "Working" : "Not working"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

