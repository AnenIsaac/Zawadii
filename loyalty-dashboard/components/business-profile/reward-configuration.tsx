import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface RewardConfigurationProps {
  profile: {
    pointsRate: number
    traIntegration: {
      deviceId: string
      tin: string
      vatRegNumber: string
      receiptPrefix?: string
      useQrValidation: boolean
    }
  }
  onSave: (changes: any) => void
}

export function RewardConfiguration({ profile, onSave }: RewardConfigurationProps) {
  const [formData, setFormData] = useState({
    pointsRate: profile.pointsRate,
    traIntegration: {
      deviceId: profile.traIntegration.deviceId,
      tin: profile.traIntegration.tin,
      vatRegNumber: profile.traIntegration.vatRegNumber,
      receiptPrefix: profile.traIntegration.receiptPrefix || "",
      useQrValidation: profile.traIntegration.useQrValidation,
    },
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target
    if (field === "pointsRate") {
      // Ensure value is between 1 and 5
      const numValue = Math.min(Math.max(Number(value), 1), 5)
      setFormData((prev) => ({ ...prev, [field]: numValue }))
    } else {
      setFormData((prev) => ({
        ...prev,
        traIntegration: { ...prev.traIntegration, [field]: value },
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Calculate example rewards
  const exampleSpend = 100000
  const rewardValue = (exampleSpend * formData.pointsRate) / 100

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pointsRate">Points per 1,000 TZS spent</Label>
          <Input
            id="pointsRate"
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={formData.pointsRate}
            onChange={(e) => handleInputChange(e, "pointsRate")}
            required
          />
          <p className="text-sm text-gray-500">
            Set between 1% and 5% of transaction value
          </p>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Example calculation:</p>
            <p>
              When a customer spends {exampleSpend.toLocaleString()} TZS:
              <br />
              At {formData.pointsRate}%, they earn{" "}
              {rewardValue.toLocaleString()} TZS worth of rewards.
            </p>
            <p className="mt-2 text-sm">
              1 point = 100 TZS worth of rewards. 10 points = 1,000 TZS.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">TRA Integration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              value={formData.traIntegration.deviceId}
              onChange={(e) => handleInputChange(e, "deviceId")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tin">TIN</Label>
            <Input
              id="tin"
              value={formData.traIntegration.tin}
              onChange={(e) => handleInputChange(e, "tin")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatRegNumber">VAT Registration Number</Label>
            <Input
              id="vatRegNumber"
              value={formData.traIntegration.vatRegNumber}
              onChange={(e) => handleInputChange(e, "vatRegNumber")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptPrefix">Receipt Format Prefix (Optional)</Label>
            <Input
              id="receiptPrefix"
              value={formData.traIntegration.receiptPrefix}
              onChange={(e) => handleInputChange(e, "receiptPrefix")}
              placeholder="e.g. B53"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="receiptValidation">Receipt Verification</Label>
            <p className="text-sm text-gray-500">
              {formData.traIntegration.useQrValidation
                ? "Using TRA QR scan for reward validation"
                : "Using manual QR-based system (Visit & Tier codes only)"}
            </p>
          </div>
          <Switch
            id="receiptValidation"
            checked={formData.traIntegration.useQrValidation}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                traIntegration: {
                  ...prev.traIntegration,
                  useQrValidation: checked,
                },
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
} 