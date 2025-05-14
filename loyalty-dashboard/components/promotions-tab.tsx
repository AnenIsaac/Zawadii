import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Trash2, Plus } from "lucide-react"
import { AddEditPromotionModal } from "./add-edit-promotion-modal"

interface Promotion {
  id: string
  title: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
  status: "active" | "scheduled" | "ended"
  priority: number
  views: number
  clicks: number
}

export function PromotionsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  // Mock data - replace with actual API calls
  const promotions: Promotion[] = [
    {
      id: "1",
      title: "Summer Special",
      description: "Get 20% off on all summer menu items",
      imageUrl: "/images/summer-special.jpg",
      startDate: "2023-06-01",
      endDate: "2023-08-31",
      status: "active",
      priority: 1,
      views: 1250,
      clicks: 342
    },
    {
      id: "2",
      title: "Weekend Brunch",
      description: "Special brunch menu available every weekend",
      imageUrl: "/images/brunch.jpg",
      startDate: "2023-05-01",
      endDate: "2023-12-31",
      status: "active",
      priority: 2,
      views: 980,
      clicks: 245
    },
    {
      id: "3",
      title: "Holiday Season",
      description: "Festive menu and special holiday treats",
      imageUrl: "/images/holiday.jpg",
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      status: "scheduled",
      priority: 3,
      views: 0,
      clicks: 0
    }
  ]

  const stats = {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === "active").length,
    scheduledPromotions: promotions.filter(p => p.status === "scheduled").length,
    totalViews: promotions.reduce((sum, p) => sum + p.views, 0),
    clickThroughRate: promotions.reduce((sum, p) => sum + p.views, 0) > 0 
      ? (promotions.reduce((sum, p) => sum + p.clicks, 0) / promotions.reduce((sum, p) => sum + p.views, 0) * 100).toFixed(1) 
      : 0
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsModalOpen(true)
  }

  const handleAddNewPromotion = () => {
    setSelectedPromotion(null)
    setIsModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "scheduled":
        return "text-blue-500"
      case "ended":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Promotions Management</h2>
        <Button 
          onClick={handleAddNewPromotion}
          className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Promotion
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium mb-2">Total Promotions</h3>
          <p className="text-3xl font-bold">{stats.totalPromotions}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium mb-2">Active Promotions</h3>
          <p className="text-3xl font-bold">{stats.activePromotions}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium mb-2">Scheduled Promotions</h3>
          <p className="text-3xl font-bold">{stats.scheduledPromotions}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium mb-2">Total Views</h3>
          <p className="text-3xl font-bold">{stats.totalViews}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium mb-2">Click-Through Rate</h3>
          <p className="text-3xl font-bold">{stats.clickThroughRate}%</p>
        </Card>
      </div>

      <div className="space-y-4">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="flex items-start gap-4 p-4 bg-white rounded-lg border"
          >
            {promotion.imageUrl ? (
              <img
                src={promotion.imageUrl}
                alt={promotion.title}
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
                  <h3 className="font-medium">{promotion.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{promotion.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPromotion(promotion)}
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
                  <span className="text-gray-500">Status: </span>
                  <span className={getStatusColor(promotion.status)}>
                    {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500">Priority: </span>
                  <span>{promotion.priority}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">Views: </span>
                  <span>{promotion.views}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">Clicks: </span>
                  <span>{promotion.clicks}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">Start: </span>
                  <span>{new Date(promotion.startDate).toLocaleDateString()}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">End: </span>
                  <span>{new Date(promotion.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddEditPromotionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        promotion={selectedPromotion}
      />
    </div>
  )
} 