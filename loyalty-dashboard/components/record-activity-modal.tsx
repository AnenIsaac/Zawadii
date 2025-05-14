"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RecordActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordActivityModal({ open, onOpenChange }: RecordActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
    amountSpent: "",
    awardPoints: false,
    note: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, awardPoints: checked }))
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
        phoneNumber: "",
        name: "",
        amountSpent: "",
        awardPoints: false,
        note: "",
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#F8843A] rounded-md p-4 flex items-center justify-center">
            <div className="text-white text-3xl font-bold">+</div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Add Customer Activity</h2>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Quickly add a new or returning customer to your loyalty program and record their purchase — even if they don't
          have the app.
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Activity recorded successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Input placeholder="Name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Amount Spent"
                name="amountSpent"
                value={formData.amountSpent}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="award-points" checked={formData.awardPoints} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="award-points">Award Points Now?</Label>
            </div>

            <div className="space-y-2">
              <Textarea placeholder="Optional Note" name="note" value={formData.note} onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full bg-[#F8843A] hover:bg-[#E77A35]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
