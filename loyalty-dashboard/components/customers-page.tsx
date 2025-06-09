"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Download, Info, Plus, MessageCircle, Users, TrendingUp, Award, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingComponent } from "@/components/ui/loading-component"
import { ErrorComponent } from "@/components/ui/error-component"
import { EmptyStateComponent } from "@/components/ui/empty-state-component"
import { CustomersDetailTable } from "@/components/customers-detail-table"
import { CustomerInteractionsTable } from "./customer-interactions-table"
import { RewardsTable } from "@/components/rewards-table"
import { RecordActivityModal } from "@/components/record-activity-modal"
import { SendBulkMessageModal } from "@/components/send-bulk-message-modal"
import { FilterPopup } from "@/components/filter-popup"
import { SortMenu } from "@/components/sort-menu"
import type { 
  BasePageProps, 
  Customer, 
  CustomerInteraction, 
  RewardsCatalog, 
  CustomerReward, 
  ProcessedCustomer,
  FilterOption,
  CustomerMetrics,
  Business
} from "@/types/common"

interface CustomersPageProps extends BasePageProps {}

interface CustomersPageData {
  business: Business | null
  interactions: CustomerInteraction[]
  customers: Customer[]
  rewardsCatalog: RewardsCatalog[]
  customerRewards: CustomerReward[]
}

// Dummy data
const dummyBusiness: Business = {
  id: "1",
  name: "Demo Coffee Shop",
  points_conversion: 10, // 10 shillings = 1 point
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  user_id: "1"
}

const dummyCustomers: Customer[] = [
  {
    id: "1",
    full_name: "John Doe",
    phone_number: "+254701234567",
    email: "john@example.com",
    nickname: "Johnny",
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z"
  },
  {
    id: "2",
    full_name: "Jane Smith",
    phone_number: "+254712345678",
    email: "jane@example.com",
    nickname: "Jane",
    created_at: "2023-02-01T14:20:00Z",
    updated_at: "2023-02-01T14:20:00Z"
  },
  {
    id: "3",
    full_name: "Mike Johnson",
    phone_number: "+254723456789",
    email: "mike@example.com",
    nickname: "Mike",
    created_at: "2023-01-20T09:15:00Z",
    updated_at: "2023-01-20T09:15:00Z"
  },
  {
    id: "4",
    full_name: "Sarah Wilson",
    phone_number: "+254734567890",
    email: "sarah@example.com",
    nickname: "Sarah",
    created_at: "2023-12-15T16:45:00Z",
    updated_at: "2023-12-15T16:45:00Z"
  },
  {
    id: "5",
    full_name: "David Brown",
    phone_number: "+254745678901",
    email: "david@example.com",
    nickname: "Dave",
    created_at: "2023-11-10T11:30:00Z",
    updated_at: "2023-11-10T11:30:00Z"
  }
]

const dummyInteractions: CustomerInteraction[] = [
  {
    id: "1",
    customer_id: "1",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "250",
    points_awarded: 25,
    description: "Coffee and pastry",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z"
  },
  {
    id: "2",
    customer_id: "1",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "180",
    points_awarded: 18,
    description: "Latte and sandwich",
    created_at: "2024-01-10T12:15:00Z",
    updated_at: "2024-01-10T12:15:00Z"
  },
  {
    id: "3",
    customer_id: "2",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "320",
    points_awarded: 32,
    description: "Meeting coffee for 3",
    created_at: "2024-01-12T14:20:00Z",
    updated_at: "2024-01-12T14:20:00Z"
  },
  {
    id: "4",
    customer_id: "2",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "150",
    points_awarded: 15,
    description: "Espresso and muffin",
    created_at: "2024-01-08T09:45:00Z",
    updated_at: "2024-01-08T09:45:00Z"
  },
  {
    id: "5",
    customer_id: "3",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "280",
    points_awarded: 28,
    description: "Cappuccino and cake slice",
    created_at: "2023-12-20T15:30:00Z",
    updated_at: "2023-12-20T15:30:00Z"
  },
  {
    id: "6",
    customer_id: "4",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "420",
    points_awarded: 42,
    description: "Team breakfast order",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z"
  },
  {
    id: "7",
    customer_id: "5",
    business_id: "1",
    interaction_type: "purchase",
    amount_spent: "190",
    points_awarded: 19,
    description: "Americano and croissant",
    created_at: "2024-01-03T07:45:00Z",
    updated_at: "2024-01-03T07:45:00Z"
  }
]

const dummyRewardsCatalog: RewardsCatalog[] = [
  {
    id: "1",
    business_id: "1",
    name: "Free Coffee",
    description: "Get a free regular coffee",
    points_required: 50,
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    business_id: "1",
    name: "Free Pastry",
    description: "Get a free pastry of your choice",
    points_required: 30,
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "3",
    business_id: "1",
    name: "10% Discount",
    description: "10% off your next purchase",
    points_required: 20,
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
]

const dummyCustomerRewards: CustomerReward[] = [
  {
    id: "1",
    customer_id: "1",
    business_id: "1",
    reward_id: "3",
    points_spent: 20,
    status: "redeemed",
    redeemed_at: "2024-01-10T12:00:00Z",
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-10T12:00:00Z",
    reward: dummyRewardsCatalog[2]
  },
  {
    id: "2", 
    customer_id: "2",
    business_id: "1",
    reward_id: "2",
    points_spent: 30,
    status: "redeemed",
    redeemed_at: "2024-01-08T14:30:00Z",
    created_at: "2024-01-08T14:30:00Z",
    updated_at: "2024-01-08T14:30:00Z",
    reward: dummyRewardsCatalog[1]
  }
]

export function CustomersPage({ user_id, business_id }: CustomersPageProps = {}) {
  // SECTION 1: State and Data Fetching
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CustomersPageData>({
    business: null,
    interactions: [],
    customers: [],
    rewardsCatalog: [],
    customerRewards: []
  })

  // Component state
  const [recordActivityModalOpen, setRecordActivityModalOpen] = useState(false)
  const [bulkMessageModalOpen, setBulkMessageModalOpen] = useState(false)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([])

  // Simulate data loading with dummy data
  const loadDummyData = () => {
    setIsLoading(true)
    // Simulate network delay
    setTimeout(() => {
      setData({
        business: dummyBusiness,
        interactions: dummyInteractions,
        customers: dummyCustomers,
        rewardsCatalog: dummyRewardsCatalog,
        customerRewards: dummyCustomerRewards
      })
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadDummyData()
  }, [])

  // Derived state and calculations
  const processedCustomers = useMemo(() => {
    const { business, interactions, customers, customerRewards } = data
    if (!business || !interactions.length || !customers.length) return []

    return customers.map(customer => {
      const customerInteractions = interactions.filter(i => i.customer_id === customer.id)
      const customerRewardHistory = customerRewards.filter(r => r.customer_id === customer.id)

      // Calculate total points from interactions
      const totalPointsEarned = customerInteractions.reduce((sum, i) => sum + (i.points_awarded || 0), 0)
      const totalPointsSpent = customerRewardHistory.reduce((sum, r) => sum + (r.points_spent || 0), 0)
      const currentPoints = totalPointsEarned - totalPointsSpent

      // Calculate total spend and visits
      const totalSpend = customerInteractions.reduce((sum, i) => sum + (Number(i.amount_spent) || 0), 0)
      const totalVisits = customerInteractions.length

      // Get last visit date
      const lastVisit = customerInteractions[0]?.created_at
      const lastVisitDate = lastVisit ? new Date(lastVisit) : null
      const daysSinceLastVisit = lastVisitDate ? 
        Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)) : 999

      // Calculate TAG
      const hasEnoughPoints = currentPoints >= 100
      const hasNotVisitedRecently = daysSinceLastVisit > 30
      const tag = hasNotVisitedRecently && hasEnoughPoints ? "Send Promotion" : "Active"

      // Calculate RPI (Reward Priority Index)
      const rewardsUsed = customerRewardHistory.length
      const rpi = Math.min(200, Math.floor(
        (totalVisits * 10) + (currentPoints * 0.5) - (rewardsUsed * 20)
      ))

      // Calculate LEI (Loyalty Engagement Index)
      const avgSpendPerVisit = totalVisits > 0 ? totalSpend / totalVisits : 0
      const visitFrequency = totalVisits > 0 ? Math.min(30, 365 / daysSinceLastVisit) : 0
      const lei = Math.min(200, Math.floor(
        (visitFrequency * 5) + (avgSpendPerVisit * 0.01)
      ))

      // Calculate spending score (0-100)
      const maxSpend = Math.max(...customers.map(c => {
        const cInteractions = interactions.filter(i => i.customer_id === c.id)
        return cInteractions.reduce((sum, i) => sum + (Number(i.amount_spent) || 0), 0)
      }), 1)
      const spendingScore = Math.min(100, Math.floor((totalSpend / maxSpend) * 100))

      return {
        ...customer,
        totalSpend: totalSpend.toLocaleString(),
        totalVisits: totalVisits.toString(),
        lastVisitDate: lastVisitDate ? lastVisitDate.toLocaleDateString('en-GB') : 'Never',
        points: currentPoints.toString(),
        tag,
        rpi: rpi.toString(),
        lei: lei.toString(),
        spendingScore,
        phoneId: customer.phone_number,
        name: customer.full_name || customer.nickname || 'Unknown'
      }
    })
  }, [data])

  // Calculate metrics
  const metrics = useMemo((): CustomerMetrics => {
    if (!processedCustomers.length) return {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      avgSpendPerVisit: 0,
      visitFrequency: 0
    }

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    const newCustomersThisMonth = data.customers.filter(c => 
      new Date(c.created_at) >= lastMonth
    ).length

    const totalSpend = processedCustomers.reduce((sum, c) => 
      sum + Number(c.totalSpend.replace(/,/g, '')), 0
    )
    const totalVisits = processedCustomers.reduce((sum, c) => 
      sum + Number(c.totalVisits), 0
    )

    return {
      totalCustomers: processedCustomers.length,
      newCustomersThisMonth,
      avgSpendPerVisit: totalVisits > 0 ? totalSpend / totalVisits : 0,
      visitFrequency: processedCustomers.length > 0 ? totalVisits / processedCustomers.length : 0
    }
  }, [processedCustomers, data.customers])

  // Event handlers
  const handleSort = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field)
    setSortDirection(direction)
  }, [])

  const handleFilter = useCallback((filters: FilterOption[]) => {
    setActiveFilters(filters)
  }, [])

  const handleRetry = useCallback(() => {
    loadDummyData()
  }, [])

  const handleRecordActivity = useCallback(() => {
    setRecordActivityModalOpen(true)
  }, [])

  const handleSendBulkMessage = useCallback(() => {
    setBulkMessageModalOpen(true)
  }, [])

  const handleExport = useCallback(() => {
    // Export functionality
    console.log('Exporting customer data...')
  }, [])

  // SECTION 2: Loading and Error States
  if (isLoading) {
    return <LoadingComponent message="Loading customers..." />
  }

  if (error) {
    return (
      <ErrorComponent 
        message={error || 'Unknown error occurred'}
        onRetry={handleRetry}
      />
    )
  }

  if (!processedCustomers.length) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button onClick={handleRecordActivity} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Activity
          </Button>
        </div>
        <EmptyStateComponent
          title="No customers yet"
          description="Start by recording customer interactions to build your customer base."
          actionLabel="Record Activity"
          onAction={handleRecordActivity}
          icon={<Users className="h-12 w-12 text-gray-400" />}
        />
      </div>
    )
  }

  // SECTION 3: Main Render
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {/* Record Activity Card */}
        <Card 
          className="p-4 bg-[#F8843A] text-white flex items-center cursor-pointer hover:bg-[#E77A35] transition-colors" 
          onClick={handleRecordActivity}
        >
          <div className="bg-white bg-opacity-20 rounded-full p-3 mr-3">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Record</h3>
            <h3 className="text-lg font-medium">Customer</h3>
            <h3 className="text-lg font-medium">Activity</h3>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Total Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{metrics.totalCustomers}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+12%</div>
          </div>
        </Card>

        {/* New Customers */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            New Customers <span className="text-xs">/month</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{metrics.newCustomersThisMonth}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+8%</div>
          </div>
        </Card>

        {/* Average Spend */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Avg Spend per Visit</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {Math.round(metrics.avgSpendPerVisit).toLocaleString()} <span className="text-sm">TZs</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <div className="bg-green-100 text-green-500 rounded-full px-2 py-0.5">+5%</div>
          </div>
        </Card>

        {/* Visit Frequency */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            Visit Frequency <span className="text-xs">/customer</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{Math.round(metrics.visitFrequency)}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <FilterPopup onFilter={handleFilter} />
          <SortMenu onSort={handleSort} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendBulkMessage} variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Bulk Message
          </Button>
          <Button onClick={handleRecordActivity} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Activity
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Customer List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Customer List</h2>
            <span className="text-sm text-gray-500">{processedCustomers.length} customers</span>
          </div>
          <Card className="p-6">
            <CustomersDetailTable
              customers={processedCustomers}
              sortField={sortField}
              sortDirection={sortDirection}
              filters={activeFilters}
            />
          </Card>
        </div>

        {/* Recent Activity & Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Interactions</h2>
              <Button variant="ghost" className="text-sm text-gray-500">
                View all
              </Button>
            </div>
            <Card className="p-6">
              <CustomerInteractionsTable
                interactions={data.interactions}
                customers={data.customers}
              />
            </Card>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Rewards Activity</h2>
              <Button variant="ghost" className="text-sm text-gray-500">
                View all
              </Button>
            </div>
            <Card className="p-6">
              <RewardsTable
                rewardsCatalog={data.rewardsCatalog}
                customerRewards={data.customerRewards}
                customers={data.customers}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordActivityModal
        open={recordActivityModalOpen}
        onOpenChange={setRecordActivityModalOpen}
        businessId={business_id || "1"}
        onSuccess={handleRetry}
      />

      <SendBulkMessageModal
        open={bulkMessageModalOpen}
        onOpenChange={setBulkMessageModalOpen}
        customers={processedCustomers}
        businessId={business_id || "1"}
      />
    </div>
  )
}
