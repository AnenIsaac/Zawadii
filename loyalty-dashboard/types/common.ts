// Common types for the loyalty dashboard application

export interface BasePageProps {
  user_id: string
  business_id: string
}

export interface Business {
  id: string
  name: string
  description?: string
  location_description?: string
  phone_number?: string
  email?: string
  logo_url?: string
  cover_image_url?: string
  status: string
  tin?: string
  instagram?: string
  facebook?: string
  x?: string
  tiktok?: string
  points_conversion?: number
  user_id: string
  created_at: string
}

export interface Customer {
  id: string
  full_name?: string
  nickname?: string
  phone_number: string
  email?: string
  date_of_birth?: string
  created_at: string
}

export interface CustomerInteraction {
  id: string
  customer_id: string
  business_id: string
  interaction_type: string
  amount_spent?: number
  points_awarded?: number
  phone_number?: string
  name?: string
  optional_note?: string
  created_at: string
}

export interface RewardsCatalog {
  id: string
  business_id: string
  title: string
  description: string
  points_required: number
  value?: number
  code?: string
  is_active: boolean
  image_url?: string
  created_at: string
}

export interface CustomerReward {
  id: string
  customer_id: string
  business_id: string
  reward_id: string
  reward_code?: string
  points_spent: number
  status: 'pending' | 'claimed' | 'redeemed' | 'expired'
  claimed_at?: string
  redeemed_at?: string
  expires_at?: string
  note?: string
  created_at: string
  reward?: RewardsCatalog
}

export interface ProcessedCustomer extends Customer {
  totalSpend: string
  totalVisits: string
  lastVisitDate: string
  points: string
  tag: string
  rpi: string
  lei: string
  spendingScore: number
  phoneId: string
  name: string
}

export interface FilterOption {
  id: number
  field: string
  operator: "greater" | "less"
  value: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomersThisMonth: number
  avgSpendPerVisit: number
  visitFrequency: number
} 