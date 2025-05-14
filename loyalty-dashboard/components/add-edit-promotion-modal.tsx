import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"

interface Promotion {
  id: string
  title: string
  description: string
  imageUrl?: string
  startDate?: string
  endDate?: string
  status: "active" | "scheduled" | "expired"
  priority: number
  views: number
  clicks: number
}

interface AddEditPromotionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: Promotion | null
}

export function AddEditPromotionModal({ open, onOpenChange, promotion }: AddEditPromotionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    status: "active" as "active" | "scheduled" | "expired",
    priority: 1,
  })

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title,
        description: promotion.description,
        imageUrl: promotion.imageUrl || "",
        startDate: promotion.startDate || "",
        endDate: promotion.endDate || "",
        status: promotion.status,
        priority: promotion.priority,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        startDate: "",
        endDate: "",
        status: "active",
        priority: 1,
      })
    }
  }, [promotion])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "active" | "scheduled" | "expired",
    }))
  }

  const handlePriorityChange = (value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      priority: value[0],
    }))
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would save the promotion to your backend
    console.log("Saving promotion:", formData)
    onOpenChange(false)
  }

  // Determine status based on dates
  const determineStatus = () => {
    const now = new Date()
    const startDate = formData.startDate ? new Date(formData.startDate) : null
    const endDate = formData.endDate ? new Date(formData.endDate) : null

    if (startDate && startDate > now) {
      return "scheduled"
    } else if (endDate && endDate < now) {
      return "expired"
    } else {
      return "active"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Promotion Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={150}
              required
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.description.length}/150 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Promotion Banner</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-500"
                }
                ${formData.imageUrl ? "h-[200px]" : "h-[120px]"}`}
            >
              <input {...getInputProps()} />
              {formData.imageUrl ? (
                <div className="relative h-full">
                  <img
                    src={formData.imageUrl}
                    alt="Promotion banner"
                    className="h-full mx-auto object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragActive
                      ? "Drop the image here"
                      : "Drag and drop image here, or click to select"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Display Priority</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="priority"
                min={1}
                max={10}
                step={1}
                value={[formData.priority]}
                onValueChange={handlePriorityChange}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8 text-center">{formData.priority}</span>
            </div>
            <p className="text-xs text-gray-500">
              Higher priority promotions will be shown first to customers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Status will be automatically determined based on start and end dates
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Promotion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 