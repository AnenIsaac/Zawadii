import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessInformation } from "./business-profile/business-information"
import { BrandIdentity } from "./business-profile/brand-identity"
import { RewardConfiguration } from "./business-profile/reward-configuration"
import { QRCodeManagement } from "./business-profile/qr-code-management"
import { BusinessOptions } from "./business-profile/business-options"
import { Card } from "@/components/ui/card"
import { AdminPasswordModal } from "./business-profile/admin-password-modal"

interface BusinessProfile {
  name: string
  type: string
  branch?: string
  description: string
  phone: string
  email: string
  address: string
  operatingHours: {
    [key: string]: { open: string; close: string }
  }
  logo?: string
  coverImage?: string
  primaryColor: string
  slogan?: string
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
    tiktok?: string
  }
  carouselImages: string[]
  pointsRate: number
  traIntegration: {
    deviceId: string
    tin: string
    vatRegNumber: string
    receiptPrefix?: string
    useQrValidation: boolean
  }
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
  status: "active" | "temporarily_closed" | "archived"
}

export function BusinessProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Partial<BusinessProfile> | null>(null)
  const [activeTab, setActiveTab] = useState("information")

  // Mock data - replace with API call
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "Burger53",
    type: "Restaurant",
    branch: "MCity",
    description: "Premium burger restaurant serving quality meals since 2020",
    phone: "+255 123 456 789",
    email: "contact@burger53.co.tz",
    address: "MCity Mall, Ground Floor, Shop 12",
    operatingHours: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "10:00", close: "22:00" },
      friday: { open: "10:00", close: "23:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "12:00", close: "22:00" },
    },
    logo: "",
    coverImage: "",
    primaryColor: "#F8843A",
    slogan: "Burgers Done Right",
    socialMedia: {
      instagram: "burger53_tz",
      facebook: "burger53tz",
      twitter: "burger53_tz",
      tiktok: "burger53tz",
    },
    carouselImages: [],
    pointsRate: 5,
    traIntegration: {
      deviceId: "EFD123456",
      tin: "123456789",
      vatRegNumber: "VAT123456",
      receiptPrefix: "B53",
      useQrValidation: true,
    },
    qrCodes: {
      joinProgram: {
        code: "join_qr_code_123",
        scans: 150,
      },
      visit: {
        code: "visit_qr_code_123",
        pointsPerVisit: 10,
        scans: 1250,
      },
      tiers: [
        {
          id: "tier1",
          title: "Bronze Spender",
          amount: 10000,
          points: 50,
          code: "tier1_qr_code_123",
          scans: 75,
        },
        {
          id: "tier2",
          title: "Silver Spender",
          amount: 20000,
          points: 120,
          code: "tier2_qr_code_123",
          scans: 45,
        },
        {
          id: "tier3",
          title: "Gold Spender",
          amount: 50000,
          points: 350,
          code: "tier3_qr_code_123",
          scans: 20,
        },
        {
          id: "tier4",
          title: "Platinum Spender",
          amount: 100000,
          points: 800,
          code: "tier4_qr_code_123",
          scans: 5,
        },
      ],
    },
    status: "active",
  })

  const handleSave = (changes: Partial<BusinessProfile>) => {
    setPendingChanges(changes)
    setIsPasswordModalOpen(true)
  }

  const handleConfirmChanges = async (password: string) => {
    // Here you would validate the password with your API
    if (password === "admin123") { // Mock validation
      if (pendingChanges) {
        setBusinessProfile(prev => ({ ...prev, ...pendingChanges }))
        setPendingChanges(null)
      }
      setIsPasswordModalOpen(false)
    }
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="information">Business Information</TabsTrigger>
            <TabsTrigger value="brand">Brand Identity</TabsTrigger>
            <TabsTrigger value="rewards">Reward Configuration</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Code Management</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <BusinessInformation
              profile={businessProfile}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="brand">
            <BrandIdentity
              profile={businessProfile}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardConfiguration
              profile={businessProfile}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="qrcodes">
            <QRCodeManagement
              profile={businessProfile}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="options">
            <BusinessOptions
              profile={businessProfile}
              onSave={handleSave}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <AdminPasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onConfirm={handleConfirmChanges}
      />
    </div>
  )
} 