"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyStateComponent } from "@/components/ui/empty-state-component"
import { Gift } from "lucide-react"
import type { RewardsCatalog, CustomerReward, Customer } from "@/types/common"

interface RewardsTableProps {
  rewardsCatalog?: RewardsCatalog[]
  customerRewards?: CustomerReward[]
  customers?: Customer[]
}

interface ProcessedReward extends CustomerReward {
  customerName: string
  rewardTitle: string
}

export function RewardsTable({ 
  rewardsCatalog = [], 
  customerRewards = [], 
  customers = [] 
}: RewardsTableProps) {
  const getCustomerName = (customerId: string): string => {
    if (!customers || customers.length === 0) {
      return 'Unknown'
    }
    const customer = customers.find(c => c.id === customerId)
    return customer?.full_name || customer?.nickname || 'Unknown'
  }

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'redeemed':
        return 'bg-green-100 text-green-800'
      case 'claimed':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const processedRewards = useMemo((): ProcessedReward[] => {
    if (!customerRewards || customerRewards.length === 0) {
      return []
    }
    
    return customerRewards.map(reward => ({
      ...reward,
      customerName: getCustomerName(reward.customer_id),
      rewardTitle: reward.reward?.title || 'Unknown Reward'
    }))
  }, [customerRewards, customers])

  if (!rewardsCatalog.length && !customerRewards.length) {
    return (
      <EmptyStateComponent
        title="No rewards configured"
        description="Create reward offers to encourage customer loyalty and repeat visits."
        icon={<Gift className="h-12 w-12 text-gray-400" />}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Rewards Catalog */}
      <div>
        <h3 className="text-md font-medium mb-3">Available Rewards</h3>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardsCatalog.length > 0 ? (
                rewardsCatalog.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reward.title}</div>
                        <div className="text-sm text-gray-500">{reward.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 font-medium">
                        {reward.points_required} pts
                      </span>
                    </TableCell>
                    <TableCell>
                      {reward.value ? `${Number(reward.value).toLocaleString()} TZs` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    No rewards available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Customer Rewards History */}
      <div>
        <h3 className="text-md font-medium mb-3">Recent Redemptions</h3>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedRewards.length > 0 ? (
                processedRewards.slice(0, 10).map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">
                      {reward.customerName}
                    </TableCell>
                    <TableCell>{reward.rewardTitle}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        -{reward.points_spent}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reward.status)}>
                        {reward.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reward.created_at).toLocaleDateString('en-GB')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No rewards redeemed yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
