import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DirectoryHeader } from "@/components/directory-header"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DirectoryHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the full directory</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">Sign In</Button>
            <div className="text-sm text-center">
              <Link href="/" className="text-british-navy hover:underline">
                <ArrowLeft className="inline-block mr-1 h-3 w-3" />
                Return to directory
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

