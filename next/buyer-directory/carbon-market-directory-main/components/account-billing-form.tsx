"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function AccountBillingForm() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Professional Plan</div>
              <div className="text-sm text-muted-foreground">£499/month</div>
            </div>
            <Badge>Current Plan</Badge>
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="font-medium">Plan Features:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full buyer directory access (advanced filters)</li>
              <li>• Custom market reports</li>
              <li>• Personalized news feed</li>
              <li>• Contact information access</li>
              <li>• 3 user licenses</li>
            </ul>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Next billing date: <span className="font-medium">June 15, 2024</span>
            </div>
            <Button variant="outline" size="sm">
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="card1">
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card1" id="card1" />
                <Label htmlFor="card1" className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-muted rounded"></div>
                  <span>•••• •••• •••• 4242</span>
                </Label>
              </div>
              <div className="text-sm text-muted-foreground">Expires 04/25</div>
            </div>
          </RadioGroup>

          <Button variant="outline" className="w-full">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Name</Label>
              <Input id="billing-name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Email</Label>
              <Input id="billing-email" type="email" defaultValue="john.doe@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" defaultValue="Acme Inc." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-line-1">Address Line 1</Label>
            <Input id="address-line-1" defaultValue="123 Main St" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-line-2">Address Line 2</Label>
            <Input id="address-line-2" defaultValue="Suite 100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="London" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input id="state" defaultValue="Greater London" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input id="postal-code" defaultValue="EC1A 1BB" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select defaultValue="uk">
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="eu">European Union</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </>
  )
}

