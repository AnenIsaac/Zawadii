import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Trash2, Plus } from "lucide-react"
import { AddEditRewardModal } from "./add-edit-reward-modal"
import { PromotionsTab } from "./promotions-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Reward {
  id: string
  name: string
  points: number
  cost: number
  description: string
  status: "active" | "inactive"
  imageUrl?: string
  termsAndConditions?: string
  startDate?: string
  endDate?: string
  redemptionCount: number
}

export function RewardsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [activeTab, setActiveTab] = useState("rewards")

  // Mock data - replace with actual API calls
  const rewards: Reward[] = [
    {
      id: "1",
      name: "Free Drink",
      points: 200,
      cost: 1.5,
      description: "Redeem for a free drink of your choice",
      status: "active",
      imageUrl: "/images/drink.png",
      termsAndConditions: "Valid for any drink up to 16oz. Cannot be combined with other offers.",
      startDate: "2023-01-01",
      redemptionCount: 32
    },
    {
      id: "2",
      name: "Free Burger",
      points: 350,
      cost: 3.5,
      description: "Redeem for a free burger",
      status: "active",
      imageUrl: "/images/burger.png",
      redemptionCount: 28
    },
    {
      id: "3",
      name: "25% Off Meal",
      points: 500,
      cost: 5,
      description: "Get 25% off your entire meal",
      status: "inactive",
      imageUrl: "/images/discount.png",
      redemptionCount: 45
    }
  ]

  const stats = {
    rewardsBudget: 50000,
    totalRedemptions: 650,
    redeemThisWeek: 12,
    mostRedeemed: 650,
    redemptionRate: 650
  }

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  const handleAddNewReward = () => {
    setSelectedReward(null)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "inactive":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rewards & Promotions</h1>

      <Tabs defaultValue="rewards" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Rewards Management</h2>
            <Button 
              onClick={handleAddNewReward}
              className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Reward
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Rewards Budget</h3>
              <p className="text-3xl font-bold">{stats.rewardsBudget.toLocaleString()} TZS</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Total Redemptions</h3>
              <p className="text-3xl font-bold">{stats.totalRedemptions}</p>
              <span className="text-green-500 text-sm">+15%</span>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Redeem this week</h3>
              <p className="text-3xl font-bold">{stats.redeemThisWeek}</p>
              <span className="text-green-500 text-sm">+15%</span>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Most Redeemed</h3>
              <p className="text-3xl font-bold">{stats.mostRedeemed}</p>
              <span className="text-green-500 text-sm">+15%</span>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Redemption Rate</h3>
              <p className="text-3xl font-bold">{stats.redemptionRate}</p>
              <span className="text-green-500 text-sm">+15%</span>
            </Card>
          </div>

          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border"
              >
                {reward.imageUrl ? (
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{reward.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditReward(reward)}
                        className="h-8 w-8"
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Points: </span>
                      <span>{reward.points}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className={getStatusColor(reward.status)}>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Redemptions: </span>
                      <span>{reward.redemptionCount}</span>
                    </div>
                    
                    {reward.startDate && (
                      <div>
                        <span className="text-gray-500">Start: </span>
                        <span>{new Date(reward.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {reward.endDate && (
                      <div>
                        <span className="text-gray-500">End: </span>
                        <span>{new Date(reward.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions">
          <PromotionsTab />
        </TabsContent>
      </Tabs>

      <AddEditRewardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        reward={selectedReward}
      />
    </div>
  )
} 