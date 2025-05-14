"use client"

import { useState } from "react"
import { Download, Info, Plus, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CustomersDetailTable } from "@/components/customers-detail-table"
import { RecordActivityModal } from "@/components/record-activity-modal"
import { SendBulkMessageModal } from "@/components/send-bulk-message-modal"
import { FilterPopup } from "@/components/filter-popup"
import { SortMenu } from "@/components/sort-menu"

interface FilterOption {
  id: number
  field: string
  operator: "greater" | "less"
  value: string
}

export function CustomersPage() {
  const [recordActivityModalOpen, setRecordActivityModalOpen] = useState(false)
  const [bulkMessageModalOpen, setBulkMessageModalOpen] = useState(false)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field)
    setSortDirection(direction)
  }

  const handleFilter = (filters: FilterOption[]) => {
    setActiveFilters(filters)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm text-gray-500 mb-2">Total Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">650</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+15%</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500 mb-2">
            New Customers <span className="text-xs">/month</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">35</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+12%</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500 mb-2">Avg Spend per Visit</div>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">
              23,500 <span className="text-sm">TZs</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-red-500">
            <div className="bg-red-100 text-red-500 rounded-full px-2 py-0.5">-3.5%</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500 mb-2">
            Visit Frequency <span className="text-xs">/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">22</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Button
          className="h-auto py-6 bg-[#F8843A] hover:bg-[#E77A35] text-white flex items-center justify-center gap-4"
          onClick={() => setRecordActivityModalOpen(true)}
        >
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="text-lg font-medium hidden md:block">Record Customer Activity</div>
            <div className="text-lg font-medium md:hidden">
              <div>Record</div>
              <div>Customer</div>
              <div>Activity</div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 border-orange-300 text-orange-500 hover:bg-orange-50 flex items-center justify-center gap-4"
          onClick={() => setBulkMessageModalOpen(true)}
        >
          <div className="bg-orange-100 rounded-full p-3">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="text-lg font-medium hidden md:block">Send Message & Promotion</div>
            <div className="text-lg font-medium md:hidden">
              <div>Send</div>
              <div>Message &</div>
              <div>Promotion</div>
            </div>
          </div>
        </Button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Customers</h2>
          <div className="flex gap-2">
            <SortMenu onSort={handleSort} />
            <FilterPopup onFilter={handleFilter} />
          </div>
        </div>
        <CustomersDetailTable sortField={sortField} sortDirection={sortDirection} filters={activeFilters} />
      </div>

      <RecordActivityModal open={recordActivityModalOpen} onOpenChange={setRecordActivityModalOpen} />
      <SendBulkMessageModal open={bulkMessageModalOpen} onOpenChange={setBulkMessageModalOpen} />
    </div>
  )
}
