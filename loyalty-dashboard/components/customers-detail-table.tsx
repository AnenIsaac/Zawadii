"use client"

import { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreVertical, MessageCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LoadingComponent } from "@/components/ui/loading-component"
import { EmptyStateComponent } from "@/components/ui/empty-state-component"
import { SendMessageModal } from "@/components/send-message-modal"
import type { ProcessedCustomer, FilterOption } from "@/types/common"

// Initial customer data
const initialCustomers = [
  {
    name: "Nicholas Patrick",
    phoneId: "+255763870355",
    totalSpend: "255,000",
    totalVisits: "10",
    lastVisitDate: "3/02/2025",
    points: "150",
    tag: "Send Promotion",
    rpi: "160",
    lei: "150",
    spendingScore: 85,
  },
  {
    name: "Cordell Edwards",
    phoneId: "+255763870355",
    totalSpend: "350,000",
    totalVisits: "12",
    lastVisitDate: "4/02/2025",
    points: "95",
    tag: "Send Promotion",
    rpi: "140",
    lei: "45",
    spendingScore: 92,
  },
  {
    name: "Derrick Spencer",
    phoneId: "+255763870355",
    totalSpend: "250,500",
    totalVisits: "9",
    lastVisitDate: "27/12/2024",
    points: "120",
    tag: "Send Promotion",
    rpi: "130",
    lei: "120",
    spendingScore: 78,
  },
  {
    name: "Larissa Burton",
    phoneId: "+255763870355",
    totalSpend: "150,000",
    totalVisits: "13",
    lastVisitDate: "22/01/2024",
    points: "120",
    tag: "Active",
    rpi: "100",
    lei: "120",
    spendingScore: 45,
  },
  {
    name: "Caroline Joune",
    phoneId: "+255763870355",
    totalSpend: "140,000",
    totalVisits: "7",
    lastVisitDate: "13/01/2025",
    points: "120",
    tag: "Active",
    rpi: "100",
    lei: "120",
    spendingScore: 65,
  },
]

interface CustomersDetailTableProps {
  customers: ProcessedCustomer[]
  sortField?: string | null
  sortDirection?: "asc" | "desc"
  filters?: FilterOption[]
  isLoading?: boolean
  error?: string | null
}

export function CustomersDetailTable({
  customers,
  sortField = null,
  sortDirection = "asc",
  filters = [],
  isLoading = false,
  error = null
}: CustomersDetailTableProps) {
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ProcessedCustomer | null>(null)

  // Map filter fields to customer data fields
  const fieldMapping: Record<string, string> = {
    "Amount Spent": "totalSpend",
    "Last Visit": "lastVisitDate",
    Points: "points",
    Tag: "tag",
    "Reward Priority Index (RPI)": "rpi",
    "Loyalty Engagement Index (LEI)": "lei",
    "Total Visits": "totalVisits",
    "Spending Score": "spendingScore",
  }

  // Derived state and calculations
  const processedCustomers = useMemo(() => {
    let filteredCustomers = [...customers]

    // Apply filters
    if (filters && filters.length > 0) {
      filteredCustomers = filteredCustomers.filter((customer) => {
        return filters.every((filter) => {
          const fieldName = fieldMapping[filter.field] || filter.field
          const customerValue = customer[fieldName as keyof ProcessedCustomer]

          // Convert to number for numeric comparisons (remove commas)
          if (["totalSpend", "points", "rpi", "lei", "totalVisits", "spendingScore"].includes(fieldName)) {
            const numValue = typeof customerValue === 'string' ? 
              Number(customerValue.toString().replace(/,/g, '')) : 
              Number(customerValue)
            const filterValue = Number(filter.value)

            if (filter.operator === "greater") {
              return numValue > filterValue
            } else {
              return numValue < filterValue
            }
          }

          // Handle date comparisons
          if (fieldName === "lastVisitDate") {
            const customerDate = new Date(customerValue.toString().split("/").reverse().join("/"))
            const filterDate = new Date(filter.value)

            if (filter.operator === "greater") {
              return customerDate > filterDate
            } else {
              return customerDate < filterDate
            }
          }

          // Handle string comparisons (like tag)
          if (filter.operator === "greater") {
            return customerValue.toString() > filter.value
          } else {
            return customerValue.toString() < filter.value
          }
        })
      })
    }

    // Apply sorting
    if (sortField) {
      filteredCustomers.sort((a, b) => {
        // Handle numeric fields
        if (["totalSpend", "points", "rpi", "lei", "totalVisits", "spendingScore"].includes(sortField)) {
          const aValue = typeof a[sortField as keyof ProcessedCustomer] === 'string' ?
            Number(a[sortField as keyof ProcessedCustomer].toString().replace(/,/g, '')) :
            Number(a[sortField as keyof ProcessedCustomer])
          const bValue = typeof b[sortField as keyof ProcessedCustomer] === 'string' ?
            Number(b[sortField as keyof ProcessedCustomer].toString().replace(/,/g, '')) :
            Number(b[sortField as keyof ProcessedCustomer])

          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        // Handle date fields
        if (sortField === "lastVisitDate") {
          // Convert DD/MM/YYYY to Date objects
          const parseDate = (dateStr: string) => {
            if (dateStr === 'Never') return new Date(0)
            const [day, month, year] = dateStr.split("/").map(Number)
            return new Date(year, month - 1, day)
          }
          
          const aDate = parseDate(a.lastVisitDate)
          const bDate = parseDate(b.lastVisitDate)

          return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
        }

        // Handle string fields
        const aValue = a[sortField as keyof ProcessedCustomer].toString()
        const bValue = b[sortField as keyof ProcessedCustomer].toString()

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      })
    }

    return filteredCustomers
  }, [customers, sortField, sortDirection, filters])

  // Event handlers
  const handleSendMessage = useCallback((customer: ProcessedCustomer) => {
    setSelectedCustomer(customer)
    setMessageModalOpen(true)
  }, [])

  const getTagColor = useCallback((tag: string): string => {
    switch (tag.toLowerCase()) {
      case 'send promotion':
        return 'bg-orange-100 text-orange-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [])

  // SECTION 2: Loading and Error States
  if (isLoading) {
    return <LoadingComponent message="Loading customers..." />
  }

  if (error) {
    return (
      <EmptyStateComponent
        title="Error loading customers"
        description={error}
      />
    )
  }

  if (!processedCustomers.length) {
    return (
      <EmptyStateComponent
        title="No customers found"
        description="No customers match your current filters or you haven't recorded any customer interactions yet."
      />
    )
  }

  // SECTION 3: Main Render
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Customer Details</h3>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>RPI</TableHead>
              <TableHead>LEI</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.name}</div>
                </TableCell>
                <TableCell>{customer.phoneId}</TableCell>
                <TableCell>{customer.totalSpend} TZs</TableCell>
                <TableCell>{customer.totalVisits}</TableCell>
                <TableCell>{customer.lastVisitDate}</TableCell>
                <TableCell>
                  <span className="text-blue-600 font-medium">
                    {customer.points}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getTagColor(customer.tag)}>
                    {customer.tag}
                  </Badge>
                </TableCell>
                <TableCell>{customer.rpi}</TableCell>
                <TableCell>{customer.lei}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSendMessage(customer)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-500">
        Showing {processedCustomers.length} of {customers.length} customers
      </div>

      {/* Send Message Modal */}
      <SendMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        customer={selectedCustomer}
      />
    </div>
  )
}
