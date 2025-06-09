"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyStateComponent } from "@/components/ui/empty-state-component"
import { Activity } from "lucide-react"
import type { CustomerInteraction, Customer } from "@/types/common"

interface CustomerInteractionsTableProps {
  interactions: CustomerInteraction[]
  customers: Customer[]
}

interface ProcessedInteraction extends CustomerInteraction {
  customerName: string
  formattedDate: string
  formattedAmount: string
}

export function CustomerInteractionsTable({ interactions, customers }: CustomerInteractionsTableProps) {
  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.full_name || customer?.nickname || 'Unknown'
  }

  const getInteractionTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'purchase':
        return 'bg-green-100 text-green-800'
      case 'visit':
        return 'bg-blue-100 text-blue-800'
      case 'referral':
        return 'bg-purple-100 text-purple-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const processedInteractions = useMemo((): ProcessedInteraction[] => {
    return interactions.slice(0, 10).map(interaction => ({
      ...interaction,
      customerName: getCustomerName(interaction.customer_id),
      formattedDate: new Date(interaction.created_at).toLocaleDateString('en-GB'),
      formattedAmount: interaction.amount_spent ? 
        `${Number(interaction.amount_spent).toLocaleString()} TZs` : '-'
    }))
  }, [interactions, customers])

  if (!interactions.length) {
    return (
      <EmptyStateComponent
        title="No customer interactions"
        description="Customer interactions will appear here once you start recording activities."
        icon={<Activity className="h-12 w-12 text-gray-400" />}
      />
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Recent Customer Interactions</h3>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedInteractions.map((interaction) => (
              <TableRow key={interaction.id}>
                <TableCell className="font-medium">
                  {interaction.customerName}
                </TableCell>
                <TableCell>
                  <Badge className={getInteractionTypeColor(interaction.interaction_type)}>
                    {interaction.interaction_type}
                  </Badge>
                </TableCell>
                <TableCell>{interaction.formattedAmount}</TableCell>
                <TableCell>
                  {interaction.points_awarded ? (
                    <span className="text-green-600 font-medium">
                      +{interaction.points_awarded}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{interaction.formattedDate}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {interaction.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {interactions.length > 10 && (
        <p className="text-sm text-gray-500 text-center">
          Showing 10 of {interactions.length} interactions
        </p>
      )}
    </div>
  )
}
