"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function AccountNotificationsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive updates and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">New Buyer Alerts</div>
              <div className="text-xs text-muted-foreground">
                Receive notifications when new buyers join the platform
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Market Updates</div>
              <div className="text-xs text-muted-foreground">Weekly digest of market trends and price movements</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">News Alerts</div>
              <div className="text-xs text-muted-foreground">Breaking news and important market developments</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Product Updates</div>
              <div className="text-xs text-muted-foreground">New features and improvements to the platform</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">In-App Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">New Buyer Alerts</div>
              <div className="text-xs text-muted-foreground">
                Receive notifications when new buyers join the platform
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Price Alerts</div>
              <div className="text-xs text-muted-foreground">Notifications when prices change significantly</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Saved Buyer Updates</div>
              <div className="text-xs text-muted-foreground">Changes to buyers you've saved</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Marketing Communications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Product Newsletters</div>
              <div className="text-xs text-muted-foreground">Monthly newsletter with tips and best practices</div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Events and Webinars</div>
              <div className="text-xs text-muted-foreground">Invitations to industry events and webinars</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Partner Offers</div>
              <div className="text-xs text-muted-foreground">Special offers from our partners</div>
            </div>
            <Switch />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  )
}

