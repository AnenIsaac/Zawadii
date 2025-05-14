"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Users, Gift, Briefcase, ShoppingBag, HelpCircle, Settings, LifeBuoy } from "lucide-react"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-60 h-full border-r bg-white flex flex-col">
      <div className="flex h-16 items-center justify-center mb-4">
        <Image
          src="/Zawadii_full_logo.svg"
          alt="Zawadii"
          width={120}
          height={32}
          className="dark:invert"
        />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/" ? "bg-orange-100 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <BarChart className="h-4 w-4" />
          Reports
        </Link>

        <Link
          href="/customers"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/customers" ? "bg-orange-100 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Users className="h-4 w-4" />
          Customers
        </Link>

        <Link 
          href="/rewards"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/rewards"
              ? "bg-orange-100 text-orange-600"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Gift className="h-4 w-4" />
          <span className="whitespace-nowrap">Rewards & Promotions</span>
        </Link>

        <Link 
          href="/business"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/business" ? "bg-orange-100 text-orange-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Business Profile
        </Link>

        <Link 
          href="#" 
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <ShoppingBag className="h-4 w-4" />
          Orders
        </Link>
      </nav>

      <div className="px-4 py-6">
        <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</h2>

        <nav className="mt-3 space-y-1">
          <Link 
            href="#" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <HelpCircle className="h-4 w-4" />
            Getting Started
          </Link>

          <Link 
            href="#" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <Link 
            href="#" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </nav>
      </div>
    </div>
  )
}
