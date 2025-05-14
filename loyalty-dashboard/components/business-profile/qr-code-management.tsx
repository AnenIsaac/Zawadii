import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Download, RefreshCw, Eye, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface QRCodeManagementProps {
  profile: {
    qrCodes: {
      joinProgram: {
        code: string
        scans: number
      }
      visit: {
        code: string
        pointsPerVisit: number
        scans: number
      }
      tiers: Array<{
        id: string
        title: string
        amount: number
        points: number
        code: string
        scans: number
        image?: string
      }>
    }
  }
  onSave: (changes: any) => void
}

export function QRCodeManagement({ profile, onSave }: QRCodeManagementProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    qrCodes: {
      ...profile.qrCodes,
    },
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tierToDelete, setTierToDelete] = useState<string | null>(null)
  const [newTier, setNewTier] = useState({
    title: "",
    amount: "",
    points: "",
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleVisitPointsChange = (value: string) => {
    const points = Math.max(0, parseInt(value) || 0)
    setFormData((prev) => ({
      ...prev,
      qrCodes: {
        ...prev.qrCodes,
        visit: {
          ...prev.qrCodes.visit,
          pointsPerVisit: points,
        },
      },
    }))
    setHasUnsavedChanges(true)
  }

  const handleTierChange = (
    tierId: string,
    field: "title" | "amount" | "points",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      qrCodes: {
        ...prev.qrCodes,
        tiers: prev.qrCodes.tiers.map((tier) =>
          tier.id === tierId
            ? {
                ...tier,
                [field]: field === "title" ? value : Math.max(0, parseInt(value) || 0),
              }
            : tier
        ),
      },
    }))
    setHasUnsavedChanges(true)
  }

  const regenerateCode = (type: "join" | "visit" | string) => {
    // In a real app, this would call an API to generate a new QR code
    const newCode = `new_${type}_qr_code_${Date.now()}`
    
    if (type === "join") {
      setFormData((prev) => ({
        ...prev,
        qrCodes: {
          ...prev.qrCodes,
          joinProgram: {
            ...prev.qrCodes.joinProgram,
            code: newCode,
          },
        },
      }))
    } else if (type === "visit") {
      setFormData((prev) => ({
        ...prev,
        qrCodes: {
          ...prev.qrCodes,
          visit: {
            ...prev.qrCodes.visit,
            code: newCode,
          },
        },
      }))
    } else {
      // Regenerate tier QR code
      setFormData((prev) => ({
        ...prev,
        qrCodes: {
          ...prev.qrCodes,
          tiers: prev.qrCodes.tiers.map((tier) =>
            tier.id === type
              ? {
                  ...tier,
                  code: newCode,
                }
              : tier
          ),
        },
      }))
    }
    setHasUnsavedChanges(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setHasUnsavedChanges(false)
  }

  const downloadQR = (code: string, name: string) => {
    // In a real app, this would generate and download a QR code image
    console.log(`Downloading QR code: ${code} as ${name}`)
  }

  const handleDeleteTier = (tierId: string) => {
    setTierToDelete(tierId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTier = () => {
    if (tierToDelete) {
      setFormData((prev) => ({
        ...prev,
        qrCodes: {
          ...prev.qrCodes,
          tiers: prev.qrCodes.tiers.filter((tier) => tier.id !== tierToDelete),
        },
      }))
      setDeleteDialogOpen(false)
      setTierToDelete(null)
      setHasUnsavedChanges(true)
    }
  }

  const handleAddTier = () => {
    if (newTier.title && newTier.amount && newTier.points) {
      const newTierId = `tier${Date.now()}`
      const newTierCode = `tier_qr_code_${Date.now()}`
      
      setFormData((prev) => ({
        ...prev,
        qrCodes: {
          ...prev.qrCodes,
          tiers: [
            ...prev.qrCodes.tiers,
            {
              id: newTierId,
              title: newTier.title,
              amount: parseInt(newTier.amount),
              points: parseInt(newTier.points),
              code: newTierCode,
              scans: 0,
            },
          ],
        },
      }))
      
      // Reset the new tier form
      setNewTier({
        title: "",
        amount: "",
        points: "",
      })
      setHasUnsavedChanges(true)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have unsaved changes. Please save your changes before leaving this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Join Program QR Code */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Join Loyalty Program Code</h3>
              <p className="text-sm text-gray-500">One-time use QR code for new customers</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadQR(formData.qrCodes.joinProgram.code, "join-program")}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => regenerateCode("join")}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {formData.qrCodes.joinProgram.scans} scans
            </span>
          </div>
        </Card>

        {/* Visit QR Code */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Visit QR Code</h3>
              <p className="text-sm text-gray-500">Scanned on every customer visit</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadQR(formData.qrCodes.visit.code, "visit")}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => regenerateCode("visit")}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Label htmlFor="visitPoints">Points per Visit</Label>
                <Input
                  id="visitPoints"
                  type="number"
                  min={0}
                  value={formData.qrCodes.visit.pointsPerVisit}
                  onChange={(e) => handleVisitPointsChange(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {formData.qrCodes.visit.scans} scans
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Spending Tier QR Codes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Spending Tier QR Codes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTier}
              disabled={!newTier.title || !newTier.amount || !newTier.points}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          </div>

          {/* New Tier Form */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="new-tier-title">Title</Label>
              <Input
                id="new-tier-title"
                value={newTier.title}
                onChange={(e) => setNewTier(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Gold Spender"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-tier-amount">Amount (TZS)</Label>
              <Input
                id="new-tier-amount"
                type="number"
                min={0}
                value={newTier.amount}
                onChange={(e) => setNewTier(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-tier-points">Points Reward</Label>
              <Input
                id="new-tier-points"
                type="number"
                min={0}
                value={newTier.points}
                onChange={(e) => setNewTier(prev => ({ ...prev, points: e.target.value }))}
                placeholder="e.g. 300"
              />
            </div>
          </div>

          <div className="space-y-4">
            {formData.qrCodes.tiers.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-[1fr,auto] gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${tier.id}-title`}>Title</Label>
                    <Input
                      id={`${tier.id}-title`}
                      value={tier.title}
                      onChange={(e) =>
                        handleTierChange(tier.id, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tier.id}-amount`}>Amount (TZS)</Label>
                    <Input
                      id={`${tier.id}-amount`}
                      type="number"
                      min={0}
                      value={tier.amount}
                      onChange={(e) =>
                        handleTierChange(tier.id, "amount", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tier.id}-points`}>Points Reward</Label>
                    <Input
                      id={`${tier.id}-points`}
                      type="number"
                      min={0}
                      value={tier.points}
                      onChange={(e) =>
                        handleTierChange(tier.id, "points", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQR(tier.code, `tier-${tier.amount}`)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateCode(tier.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteTier(tier.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {tier.scans} scans
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this QR code? This action cannot be undone.
              All scan history for this tier will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTier} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
} 