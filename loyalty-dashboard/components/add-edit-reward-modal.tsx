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
import { Switch } from "@/components/ui/switch"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"

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

interface AddEditRewardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reward?: Reward | null
}

export function AddEditRewardModal({ open, onOpenChange, reward }: AddEditRewardModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    points: 0,
    cost: 0,
    description: "",
    status: "active" as "active" | "inactive",
    imageUrl: "",
    termsAndConditions: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        points: reward.points,
        cost: reward.cost,
        description: reward.description,
        status: reward.status,
        imageUrl: reward.imageUrl || "",
        termsAndConditions: reward.termsAndConditions || "",
        startDate: reward.startDate || "",
        endDate: reward.endDate || "",
      })
    } else {
      setFormData({
        name: "",
        points: 0,
        cost: 0,
        description: "",
        status: "active",
        imageUrl: "",
        termsAndConditions: "",
        startDate: "",
        endDate: "",
      })
    }
  }, [reward])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "active" : "inactive",
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
    // Here you would save the reward to your backend
    console.log("Saving reward:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{reward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points Required</Label>
              <Input
                id="points"
                name="points"
                type="number"
                min={0}
                value={formData.points}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (TZS)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min={0}
                value={formData.cost}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="status">
                  {formData.status === "active" ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Reward Image</Label>
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
                    alt="Reward image"
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
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
            <Textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleInputChange}
              placeholder="Enter any terms and conditions for this reward"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Reward</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 