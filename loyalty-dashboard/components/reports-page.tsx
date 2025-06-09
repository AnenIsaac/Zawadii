"use client"

import { useState } from "react"
import { Download, Info, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActivityChart } from "@/components/activity-chart"
import { CustomersTable } from "@/components/customers-table"
import { RewardsTable } from "@/components/rewards-table"
import { RecordActivityModal } from "@/components/record-activity-modal"
import type { BasePageProps } from "@/types/common"

interface ReportsPageProps extends BasePageProps {}

export function ReportsPage({ user_id, business_id }: ReportsPageProps) {
  const [chartView, setChartView] = useState<"Month" | "Week" | "Day">("Month")
  const [recordActivityModalOpen, setRecordActivityModalOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-[#F8843A] text-white flex items-center cursor-pointer hover:bg-[#E77A35]" onClick={() => setRecordActivityModalOpen(true)}>
          <div className="bg-white bg-opacity-20 rounded-full p-3 mr-3">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Record</h3>
            <h3 className="text-lg font-medium">Customer</h3>
            <h3 className="text-lg font-medium">Activity</h3>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Total Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">650</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+15%</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            New Customers <span className="text-xs">/month</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">35</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+12%</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Avg Spend per Visit</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
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

        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            Visit Frequency <span className="text-xs">/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">22</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Activity</h2>
          <Select value={chartView} onValueChange={(value: "Month" | "Week" | "Day") => setChartView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="p-4">
          <ActivityChart timeFrame={chartView} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Customers</h2>
            <Button variant="ghost" className="text-sm text-gray-500 flex items-center">
              See all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CustomersTable />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Rewards</h2>
            <Button variant="ghost" className="text-sm text-gray-500 flex items-center">
              See all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <RewardsTable />
        </div>
      </div>

      <RecordActivityModal 
        open={recordActivityModalOpen} 
        onOpenChange={setRecordActivityModalOpen}
        businessId={business_id}
      />
    </div>
  )
}
