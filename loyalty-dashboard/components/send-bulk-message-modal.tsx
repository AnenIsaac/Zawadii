"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, PenLine, Plus, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SendBulkMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FilterOption {
  id: number
  type: string
  range: string
  value: string
}

export function SendBulkMessageModal({ open, onOpenChange }: SendBulkMessageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachReward, setAttachReward] = useState(false)
  const [selectedReward, setSelectedReward] = useState("")
  const [message, setMessage] = useState("")
  const [filters, setFilters] = useState<FilterOption[]>([])
  const [customerCount, setCustomerCount] = useState(45) // Initial count of all customers

  const filterOptions = [
    "Amount Spent",
    "Last Visit",
    "Points",
    "Tag",
    "Reward Priority Index (RPI)",
    "Loyalty Engagement Index (LPI)",
  ]

  const tagOptions = ["Active", "Send Promotion", "VIP", "New"]

  // Update customer count based on filters
  useEffect(() => {
    // This would typically be an API call to get the filtered count
    // For now, we'll simulate it with a simple calculation
    let count = 45 // Base count
    filters.forEach(filter => {
      if (filter.value) {
        // Simulate reducing count based on filter
        count = Math.floor(count * 0.8) // Reduce by 20% for each active filter
      }
    })
    setCustomerCount(count)
  }, [filters])

  const handleAddFilter = () => {
    const newFilter = {
      id: Date.now(),
      type: filterOptions[0],
      range: "greater",
      value: "",
    }
    setFilters([...filters, newFilter])
  }

  const handleRemoveFilter = (id: number) => {
    setFilters(filters.filter((filter) => filter.id !== id))
  }

  const handleFilterChange = (id: number, field: keyof FilterOption, value: string) => {
    setFilters(filters.map((filter) => (filter.id === id ? { ...filter, [field]: value } : filter)))
  }

  const getFilterInput = (filter: FilterOption) => {
    if (filter.type === "Tag") {
      return (
        <Select value={filter.value} onValueChange={(value) => handleFilterChange(filter.id, "value", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tag" />
          </SelectTrigger>
          <SelectContent>
            {tagOptions.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    const getPlaceholder = () => {
      switch (filter.type) {
        case "Amount Spent":
          return "Enter amount (e.g. 100)"
        case "Points":
          return "Enter points (e.g. 500)"
        case "Last Visit":
          return "Select date"
        case "Reward Priority Index (RPI)":
          return "Enter RPI (e.g. 75)"
        case "Loyalty Engagement Index (LPI)":
          return "Enter LPI (e.g. 80)"
        default:
          return "Enter value"
      }
    }

    return (
      <Input
        type={filter.type === "Last Visit" ? "date" : "number"}
        value={filter.value}
        onChange={(e) => handleFilterChange(filter.id, "value", e.target.value)}
        placeholder={getPlaceholder()}
      />
    )
  }

  const getRangeOptions = (filter: FilterOption) => {
    if (filter.type === "Tag") {
      return null // Don't show range selector for tags
    }

    return (
      <Select value={filter.range} onValueChange={(value) => handleFilterChange(filter.id, "range", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="greater">Greater than</SelectItem>
          <SelectItem value="less">Less than</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    onOpenChange(false)

    // Reset form
    setMessage("")
    setAttachReward(false)
    setSelectedReward("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Send Bulk Message</h2>
          <p className="text-gray-500 mt-2">
            Send targeted messages or promotions to customers based on filters like total spend, loyalty behavior (LEI),
            total visits and more...
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-medium">
            Customers Available: <span className="font-bold">{customerCount}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2">
                <div className="w-[180px]">
                  <Select value={filter.type} onValueChange={(value) => handleFilterChange(filter.id, "type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[120px]">
                  {getRangeOptions(filter)}
                </div>
                <div className="w-[200px]">
                  {getFilterInput(filter)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-orange-100 hover:bg-orange-200"
                  onClick={() => handleRemoveFilter(filter.id)}
                >
                  <Minus className="h-4 w-4 text-orange-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full border border-dashed border-gray-300 text-gray-500 hover:text-orange-500 hover:border-orange-300"
            onClick={handleAddFilter}
          >
            <Plus className="h-4 w-4 mr-2" /> Add filter
          </Button>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="attach-reward"
              checked={attachReward}
              onCheckedChange={(checked) => setAttachReward(checked as boolean)}
              className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
            />
            <Label htmlFor="attach-reward" className="text-base">
              Attach a Reward?
            </Label>
          </div>

          {attachReward && (
            <Select value={selectedReward} onValueChange={setSelectedReward}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Reward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free-drink">Free Drink</SelectItem>
                <SelectItem value="free-dessert">Free Dessert</SelectItem>
                <SelectItem value="discount">25% Off Meal</SelectItem>
                <SelectItem value="free-chips">Free Chips</SelectItem>
                <SelectItem value="bogo">Buy-1-get-1-Free</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="relative">
            <Textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-orange-500"
            >
              <PenLine className="h-5 w-5" />
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 bg-[#F8843A] hover:bg-[#E77A35] text-white text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
