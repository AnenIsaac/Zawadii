import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"

interface BusinessOptionsProps {
  profile: {
    status: "active" | "temporarily_closed" | "archived"
  }
  onSave: (changes: any) => void
}

export function BusinessOptions({ profile, onSave }: BusinessOptionsProps) {
  const [formData, setFormData] = useState({
    status: profile.status,
  })

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as "active" | "temporarily_closed" | "archived" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Business Status</Label>
          <Select
            value={formData.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="temporarily_closed">Temporarily Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.status === "temporarily_closed" && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Business Temporarily Closed</AlertTitle>
            <AlertDescription>
              Your business profile is marked as temporarily closed. Customers will see this status when they visit your profile.
            </AlertDescription>
          </Alert>
        )}

        {formData.status === "archived" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Business Archived</AlertTitle>
            <AlertDescription>
              Your business profile is archived. This means it is no longer visible to customers and all operations are suspended.
            </AlertDescription>
          </Alert>
        )}

        {formData.status === "active" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Business Active</AlertTitle>
            <AlertDescription>
              Your business profile is active and visible to customers. All operations are running normally.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
} 