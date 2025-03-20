"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Globe,
  ChevronDown,
  BarChart3,
  Users,
  UserCircle,
  Share2,
  Database,
  Home,
  Menu,
  X,
  Newspaper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/useAuth'

/**
 * Main navigation component for the site header
 */
export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-british-navy text-white">
      <Link className="flex items-center justify-center" href="/">
        <Globe className="h-6 w-6 text-white" />
        <span className="ml-2 text-xl font-bold text-white">CarbonConnect</span>
      </Link>

      {/* Mobile menu button */}
      <button className="ml-auto md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop navigation */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="#features">
          Features
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="#pricing">
          Pricing
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="#testimonials">
          Testimonials
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="/directory">
          Directory
        </Link>
        <Link className="text-sm font-medium text-white hover:text-british-lightBlue" href="/news">
          News
        </Link>

        {/* Pages Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-british-lightBlue hover:bg-british-darkNavy flex items-center gap-1 p-0"
            >
              <span className="text-sm font-medium">Pages</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/directory" className="flex items-center cursor-pointer">
                <Database className="mr-2 h-4 w-4" />
                <span>Carbon Buyer Directory</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/news" className="flex items-center cursor-pointer">
                <Newspaper className="mr-2 h-4 w-4" />
                <span>Carbon Market News</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/analytics" className="flex items-center cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Market Analytics</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/leads" className="flex items-center cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Lead Management</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/referral" className="flex items-center cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Referral Program</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/directory/v1" className="flex items-center cursor-pointer">
                <Database className="mr-2 h-4 w-4" />
                <span>Legacy Directory (v1)</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-british-red text-white hover:bg-british-red/90">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-british-navy z-50 p-4 border-b border-british-lightBlue/20 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              className="text-sm font-medium text-white hover:text-british-lightBlue"
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium text-white hover:text-british-lightBlue"
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              className="text-sm font-medium text-white hover:text-british-lightBlue"
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              className="text-sm font-medium text-white hover:text-british-lightBlue"
              href="/directory"
              onClick={() => setMobileMenuOpen(false)}
            >
              Directory
            </Link>
            <Link
              className="text-sm font-medium text-white hover:text-british-lightBlue"
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>

            <div className="py-2 border-t border-british-lightBlue/20">
              <p className="text-sm font-medium text-british-lightBlue mb-2">Pages</p>
              <div className="flex flex-col gap-3 pl-2">
                <Link
                  href="/"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/directory"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  <span>Carbon Buyer Directory</span>
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Market Analytics</span>
                </Link>
                <Link
                  href="/leads"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Lead Management</span>
                </Link>
                <Link
                  href="/account"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
                <Link
                  href="/referral"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Referral Program</span>
                </Link>
                <Link
                  href="/directory/v1"
                  className="flex items-center text-sm text-white hover:text-british-lightBlue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  <span>Legacy Directory (v1)</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-british-lightBlue/20">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-white text-white hover:bg-british-darkNavy hover:text-white"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-british-red text-white hover:bg-british-red/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

