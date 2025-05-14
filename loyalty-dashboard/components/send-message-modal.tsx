"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, Loader2, PenLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerData {
  name: string
  phoneId: string
  points: string
  totalSpend: string
}

interface SendMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerData | null
}

export function SendMessageModal({ open, onOpenChange, customer }: SendMessageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    message: "",
    attachReward: false,
    selectedReward: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, attachReward: checked }))
  }

  const handleRewardChange = (value: string) => {
    setFormData((prev) => ({ ...prev, selectedReward: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)

    // Reset and close after showing success
    setTimeout(() => {
      setIsSuccess(false)
      onOpenChange(false)
      setFormData({
        message: "",
        attachReward: false,
        selectedReward: "",
      })
    }, 1500)
  }

  if (!customer) return null

  // Calculate reward value (2% of total spend for this example)
  const totalSpendValue = Number.parseInt(customer.totalSpend.replace(/,/g, ""))
  const rewardValue = Math.round(totalSpendValue * 0.02).toLocaleString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center text-center mb-4">
          <div className="bg-[#F8843A] rounded-md p-4 flex items-center justify-center mb-4">
            <div className="text-white text-3xl font-bold">+</div>
          </div>
          <h2 className="text-lg font-medium">Send a message to</h2>
          <h2 className="text-xl font-bold">{customer.name}</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4 text-center">
          You can spend up to TZS {rewardValue} on this customer without reducing your profit margin
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Message sent successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone Number:</span>
                <span>{customer.phoneId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Points:</span>
                <span>{customer.points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Spent:</span>
                <span>TZS {customer.totalSpend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reward Value Balance:</span>
                <span>TZS {rewardValue}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="attach-reward" checked={formData.attachReward} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="attach-reward">Attach a Reward?</Label>
            </div>

            {formData.attachReward && (
              <Select value={formData.selectedReward} onValueChange={handleRewardChange}>
                <SelectTrigger>
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

            <div className="space-y-2 relative">
              <Textarea
                placeholder="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="min-h-[120px]"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-orange-500"
              >
                <PenLine className="h-4 w-4" />
              </Button>
            </div>

            <Button type="submit" className="w-full bg-[#F8843A] hover:bg-[#E77A35]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
