import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PenLine, Trash2, Plus, Gift, TrendingUp, QrCode, Info, Search, Filter, Printer } from "lucide-react"
import { AddEditRewardModal } from "./add-edit-reward-modal"
import { CodeGenerationModal } from "./code-generation-modal"
import { PromotionsTab } from "./promotions-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Business } from "@/types/common"

interface ZawadiiSettings {
  id: number
  money_points_ratio_ratio: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  cost: number
  status: 'active' | 'inactive'
  image: string | null
  redemptionCount: number
  createdAt: string
  expiresAt: string | null
}

export function RewardsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [activeTab, setActiveTab] = useState("rewards")
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [settings, setSettings] = useState<ZawadiiSettings | null>(null)
  const [user, setUser] = useState<any>(null)
  const [codeCounts, setCodeCounts] = useState<{ [rewardId: string]: number }>({})
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [selectedRewardForCodes, setSelectedRewardForCodes] = useState<{id: string, name: string} | null>(null)
  const { toast } = useToast()

  const [weeklyRedemptions, setWeeklyRedemptions] = useState(0)
  const [redemptionRate, setRedemptionRate] = useState(0)
  const [rewardsBudget, setRewardsBudget] = useState(0)
  const [amountSpentThisMonth, setAmountSpentThisMonth] = useState(0)
  const [roiThisMonth, setROIThisMonth] = useState(0)
  const [mostPopularReward, setMostPopularReward] = useState('None')

  // Codes tab state
  const [allCodes, setAllCodes] = useState<any[]>([])
  const [filteredCodes, setFilteredCodes] = useState<any[]>([])
  const [codeFilter, setCodeFilter] = useState<'all' | 'unused' | 'redeemed'>('all')
  const [codeSearchQuery, setCodeSearchQuery] = useState('')
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Print codes state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [includeRedeemedCodes, setIncludeRedeemedCodes] = useState(false)

    const loadRewards = async () => {
      try {
      if (!business?.id) {
        console.log('No business ID available yet')
        return
      }

      console.log('Loading rewards for business:', business.id)
      const supabase = createClientComponentClient()
      
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      console.log('Rewards data:', rewardsData)
      console.log('Rewards error:', rewardsError)

      if (rewardsError) {
        throw rewardsError
      }

      if (!rewardsData || rewardsData.length === 0) {
        setRewards([])
        return
      }

      // Get redemption counts for all rewards
      console.log('Loading redemption counts...')
      const rewardIds = rewardsData.map(r => r.id)
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('reward_codes')
        .select('reward_id')
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .in('reward_id', rewardIds)

      if (redemptionError) {
        console.warn('Error loading redemption counts:', redemptionError)
      }

      console.log('Redemption data:', redemptionData)

      // Count redemptions per reward
      const redemptionCounts: { [rewardId: string]: number } = {}
      rewardIds.forEach(id => redemptionCounts[id] = 0)
      
      redemptionData?.forEach(redemption => {
        redemptionCounts[redemption.reward_id] = (redemptionCounts[redemption.reward_id] || 0) + 1
      })

      console.log('Calculated redemption counts:', redemptionCounts)

      // Transform Supabase data to match the component's expected format
      const transformedRewards = rewardsData.map(reward => ({
        id: reward.id,
        name: reward.title,
        description: reward.description || '',
        pointsCost: reward.points_required,
        cost: reward.cost,
        status: reward.is_active ? 'active' as const : 'inactive' as const,
        image: reward.image_url,
        redemptionCount: redemptionCounts[reward.id] || 0,
        createdAt: reward.created_at,
        expiresAt: null // Add expiry date when you implement it
      }))

      setRewards(transformedRewards)
      } catch (error) {
        console.error("Failed to load rewards:", error)
        toast({
          title: "Error",
          description: "Failed to load rewards. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    const fetchUserAndBusiness = async () => {
      const supabase = createClientComponentClient()
      
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          throw new Error('No authenticated user')
        }
        setUser(currentUser)

        // Get business data
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()

        if (businessError && businessError.code !== 'PGRST116') {
          throw businessError
        }
        
        setBusiness(businessData)

        // Get zawadii settings (points conversion rate)
        console.log('Fetching zawadii_settings...')
        try {
          const { data: settingsData, error: settingsError } = await supabase
            .from('zawadii_settings')
            .select('*')
            .eq('id', 1)
            .single()

          console.log('Settings data:', settingsData)
          console.log('Settings error:', settingsError)

          if (settingsError) {
            console.warn('Could not fetch zawadii settings:', settingsError)
            
            // Try to fetch all records to see if table exists and has data
            console.log('Trying to fetch all zawadii_settings records...')
            const { data: allSettings, error: allError } = await supabase
              .from('zawadii_settings')
              .select('*')
            
            console.log('All settings:', allSettings)
            console.log('All settings error:', allError)

            // Set default settings if we can't fetch from database
            console.log('Setting default money_points_ratio_ratio to 1')
            setSettings({ id: 1, money_points_ratio_ratio: 1 })
            
          } else {
            setSettings(settingsData)
            console.log('Settings state updated with database data:', settingsData)
          }
        } catch (err) {
          console.error('Error in settings fetch try/catch:', err)
          // Set default settings on error
          console.log('Setting default money_points_ratio_ratio to 1 due to error')
          setSettings({ id: 1, money_points_ratio_ratio: 1 })
        }
        
      } catch (error) {
        console.error('Failed to fetch user/business data:', error)
        toast({
          title: "Error",
          description: "Failed to load business data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchUserAndBusiness()
  }, [toast])

  // Load rewards when business data becomes available
  useEffect(() => {
    if (business?.id) {
      loadRewards()
    }
  }, [business?.id])

  // Load code counts when rewards are loaded
  useEffect(() => {
    if (rewards.length > 0) {
      loadCodeCounts()
    }
  }, [rewards, business?.id])

  // Function to load code counts for all rewards
  const loadCodeCounts = async () => {
    if (!business?.id || rewards.length === 0) return

    console.log('Loading code counts for business:', business.id, 'with rewards:', rewards.map(r => r.id))

    try {
      const supabase = createClientComponentClient()
      
      // Get count of unused codes for each reward
      const rewardIds = rewards.map(r => r.id)
      const { data: codeData, error } = await supabase
        .from('reward_codes')
        .select('reward_id')
        .eq('business_id', business.id)
        .eq('status', 'unused')
        .in('reward_id', rewardIds)

      if (error) {
        console.error('Error loading code counts:', error)
        return
      }

      console.log('Code count data from database:', codeData)

      // Count codes per reward
      const counts: { [rewardId: string]: number } = {}
      rewardIds.forEach(id => counts[id] = 0)
      
      codeData?.forEach(code => {
        counts[code.reward_id] = (counts[code.reward_id] || 0) + 1
      })

      console.log('Calculated code counts:', counts)
      setCodeCounts(counts)
    } catch (error) {
      console.error('Failed to load code counts:', error)
    }
  }

  // Function to refresh redemption counts
  const loadRedemptionCounts = async () => {
    if (!business?.id || rewards.length === 0) return

    console.log('Refreshing redemption counts for business:', business.id)

    try {
      const supabase = createClientComponentClient()
      
      // Get redemption counts for all rewards
      const rewardIds = rewards.map(r => r.id)
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('reward_codes')
        .select('reward_id')
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .in('reward_id', rewardIds)

      if (redemptionError) {
        console.error('Error loading redemption counts:', redemptionError)
        return
      }

      console.log('Updated redemption data:', redemptionData)

      // Count redemptions per reward
      const redemptionCounts: { [rewardId: string]: number } = {}
      rewardIds.forEach(id => redemptionCounts[id] = 0)
      
      redemptionData?.forEach(redemption => {
        redemptionCounts[redemption.reward_id] = (redemptionCounts[redemption.reward_id] || 0) + 1
      })

      console.log('Updated redemption counts:', redemptionCounts)

      // Update rewards with new redemption counts
      setRewards(prevRewards => 
        prevRewards.map(reward => ({
          ...reward,
          redemptionCount: redemptionCounts[reward.id] || 0
        }))
      )
    } catch (error) {
      console.error('Failed to refresh redemption counts:', error)
    }
  }

  // Function to load weekly redemption stats
  const loadWeeklyRedemptions = async () => {
    if (!business?.id) return 0

    try {
      const supabase = createClientComponentClient()
      
      // Get redemptions from the last 7 days
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: weeklyData, error } = await supabase
        .from('reward_codes')
        .select('id')
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .gte('redeemed_at', weekAgo.toISOString())

      if (error) {
        console.error('Error loading weekly redemptions:', error)
        return 0
      }

      return weeklyData?.length || 0
    } catch (error) {
      console.error('Failed to load weekly redemptions:', error)
      return 0
    }
  }

  // Load weekly redemptions when rewards change
  useEffect(() => {
    if (business?.id && rewards.length > 0) {
      loadWeeklyRedemptions().then(setWeeklyRedemptions)
    }
  }, [business?.id, rewards.length])

  // Function to calculate redemption rate
  const calculateRedemptionRate = async () => {
    if (!business?.id) return 0

    try {
      const supabase = createClientComponentClient()
      
      // Get total codes generated
      const { data: totalCodes, error: totalError } = await supabase
        .from('reward_codes')
        .select('id')
        .eq('business_id', business.id)

      // Get total codes redeemed
      const { data: redeemedCodes, error: redeemedError } = await supabase
        .from('reward_codes')
        .select('id')
        .eq('business_id', business.id)
        .eq('status', 'redeemed')

      if (totalError || redeemedError) {
        console.error('Error calculating redemption rate:', { totalError, redeemedError })
        return 0
      }

      const totalCount = totalCodes?.length || 0
      const redeemedCount = redeemedCodes?.length || 0

      if (totalCount === 0) return 0

      const rate = Math.round((redeemedCount / totalCount) * 100)
      console.log('Redemption rate calculation:', { totalCount, redeemedCount, rate })
      
      return rate
    } catch (error) {
      console.error('Failed to calculate redemption rate:', error)
      return 0
    }
  }

  // Load redemption rate when business and rewards are available
  useEffect(() => {
    if (business?.id && rewards.length > 0) {
      calculateRedemptionRate().then(setRedemptionRate)
    }
  }, [business?.id, rewards.length])

  // Enhanced statistics calculation functions
  const calculateRewardsBudget = async () => {
    if (!business?.id || rewards.length === 0) return 0

    try {
      const supabase = createClientComponentClient()
      
      // Get all unused codes with their reward costs
      const { data: codeData, error } = await supabase
        .from('reward_codes')
        .select(`
          reward_id,
          rewards!inner(cost)
        `)
        .eq('business_id', business.id)
        .eq('status', 'unused')

      if (error) {
        console.error('Error calculating rewards budget:', error)
        return 0
      }

      // Calculate total value of available codes
      const totalBudget = codeData?.reduce((sum, code) => {
        const rewardCost = code.rewards?.cost || 0
        return sum + rewardCost
      }, 0) || 0

      console.log('Rewards budget calculation:', { codeData, totalBudget })
      return totalBudget
    } catch (error) {
      console.error('Failed to calculate rewards budget:', error)
      return 0
    }
  }

  const calculateAmountSpentThisMonth = async () => {
    if (!business?.id) return 0

    try {
      const supabase = createClientComponentClient()
      
      // Get start of current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Get redemptions from this month with reward costs
      const { data: redemptionData, error } = await supabase
        .from('reward_codes')
        .select(`
          reward_id,
          redeemed_at,
          rewards!inner(cost)
        `)
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .gte('redeemed_at', startOfMonth.toISOString())

      if (error) {
        console.error('Error calculating amount spent this month:', error)
        return 0
      }

      // Sum up the costs of redeemed rewards
      const totalSpent = redemptionData?.reduce((sum, redemption) => {
        const rewardCost = redemption.rewards?.cost || 0
        return sum + rewardCost
      }, 0) || 0

      console.log('Amount spent this month calculation:', { redemptionData, totalSpent })
      return totalSpent
    } catch (error) {
      console.error('Failed to calculate amount spent this month:', error)
      return 0
    }
  }

  const calculateROIThisMonth = async () => {
    if (!business?.id) return 0

    try {
      const supabase = createClientComponentClient()
      
      // Get start of current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Get redemptions from this month where customer_id is not null (customer bought it)
      const { data: redemptionData, error } = await supabase
        .from('reward_codes')
        .select(`
          reward_id,
          customer_id,
          bought_at,
          rewards!inner(points_required)
        `)
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .not('customer_id', 'is', null)
        .gte('bought_at', startOfMonth.toISOString())

      if (error) {
        console.error('Error calculating ROI this month:', error)
        return 0
      }

      // Get business cashback percentage (e.g., 2 means 2% cashback)
      const businessCashbackPercent = business?.points_conversion || 2
      const cashbackRate = businessCashbackPercent / 100 // Convert 2 to 0.02

      console.log('ROI calculation - Business cashback:', { 
        businessCashbackPercent, 
        cashbackRate,
        businessData: business 
      })

      // Calculate total customer spending based on points required and cashback rate
      const totalROI = redemptionData?.reduce((sum, redemption) => {
        const pointsRequired = redemption.rewards?.points_required || 0
        // Customer spending = points required / cashback rate
        // If 100 points needed and 2% cashback, customer spent: 100 / 0.02 = 5000 TZS
        const customerSpending = pointsRequired / cashbackRate
        
        console.log('ROI calculation per redemption:', {
          pointsRequired,
          businessCashbackPercent,
          cashbackRate,
          customerSpending
        })
        
        return sum + customerSpending
      }, 0) || 0

      console.log('ROI this month calculation:', { 
        redemptionData: redemptionData?.length,
        businessCashbackPercent,
        cashbackRate,
        totalROI 
      })
      return Math.round(totalROI)
    } catch (error) {
      console.error('Failed to calculate ROI this month:', error)
      return 0
    }
  }

  const getMostPopularRewardThisMonth = async () => {
    if (!business?.id) return 'None'

    try {
      const supabase = createClientComponentClient()
      
      // Get start of current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Get redemptions from this month grouped by reward
      const { data: redemptionData, error } = await supabase
        .from('reward_codes')
        .select(`
          reward_id,
          rewards!inner(title)
        `)
        .eq('business_id', business.id)
        .eq('status', 'redeemed')
        .gte('redeemed_at', startOfMonth.toISOString())

      if (error) {
        console.error('Error getting most popular reward:', error)
        return 'None'
      }

      if (!redemptionData || redemptionData.length === 0) {
        return 'None'
      }

      // Count redemptions per reward
      const rewardCounts: { [rewardId: string]: { count: number, name: string } } = {}
      
      redemptionData.forEach(redemption => {
        const rewardId = redemption.reward_id
        const rewardName = redemption.rewards?.title || 'Unknown'
        
        if (!rewardCounts[rewardId]) {
          rewardCounts[rewardId] = { count: 0, name: rewardName }
        }
        rewardCounts[rewardId].count += 1
      })

      // Find the reward with most redemptions
      let mostPopular = { name: 'None', count: 0 }
      Object.values(rewardCounts).forEach(reward => {
        if (reward.count > mostPopular.count) {
          mostPopular = reward
        }
      })

      console.log('Most popular reward calculation:', { rewardCounts, mostPopular })
      return mostPopular.name
    } catch (error) {
      console.error('Failed to get most popular reward:', error)
      return 'None'
    }
  }

  // Function to load all codes for the codes tab
  const loadAllCodes = async () => {
    if (!business?.id) return

    setIsLoadingCodes(true)
    try {
      const supabase = createClientComponentClient()
      
      // First try a simpler query to see if there are any issues
      console.log('Loading codes for business:', business.id)
      
      const { data: codesData, error } = await supabase
        .from('reward_codes')
        .select(`
          *,
          rewards!inner(title, description, points_required, cost),
          customers!left(full_name, email)
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      console.log('Query completed. Error:', error, 'Data count:', codesData?.length)

      if (error) {
        console.error('Error loading codes:', JSON.stringify(error, null, 2))
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Try a simpler query without customers join
        console.log('Trying simpler query without customers...')
        const { data: simpleCodes, error: simpleError } = await supabase
          .from('reward_codes')
          .select(`
            *,
            rewards!inner(title, description, points_required, cost)
          `)
          .eq('business_id', business.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (simpleError) {
          console.error('Simple query also failed:', simpleError)
          toast({
            title: "Error",
            description: `Failed to load codes: ${error.message || 'Database connection issue'}`,
            variant: "destructive",
          })
          return
        } else {
          console.log('Simple query succeeded with', simpleCodes?.length, 'codes')
          setAllCodes(simpleCodes || [])
          toast({
            title: "Warning",
            description: "Codes loaded but customer names may not be available.",
            variant: "default",
          })
          return
        }
      }

      console.log('Loaded codes successfully:', codesData?.length || 0, 'codes')
      // Debug customer data
      if (codesData && codesData.length > 0) {
        console.log('Sample code with customer data:', codesData.find(c => c.customer_id))
        codesData.forEach((code, index) => {
          if (code.customer_id && index < 3) {
            console.log(`Code ${index + 1} customer data:`, {
              customer_id: code.customer_id,
              customers: code.customers,
              status: code.status
            })
          }
        })
        
        // If customer data is missing, try to fetch it separately
        const codesWithMissingCustomers = codesData.filter(code => 
          code.customer_id && (!code.customers || !code.customers.full_name)
        )
        
        if (codesWithMissingCustomers.length > 0) {
          console.log('Found codes with missing customer data, fetching separately...')
          const customerIds = [...new Set(codesWithMissingCustomers.map(c => c.customer_id))]
          
          const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('id, full_name, email')
            .in('id', customerIds)
          
          if (!customersError && customersData) {
            console.log('Fetched customer data separately:', customersData)
            // Map customer data back to codes
            const enrichedCodes = codesData.map(code => {
              if (code.customer_id && (!code.customers || !code.customers.full_name)) {
                const customer = customersData.find(c => c.id === code.customer_id)
                if (customer) {
                  return {
                    ...code,
                    customers: {
                      full_name: customer.full_name,
                      email: customer.email
                    }
                  }
                }
              }
              return code
            })
            setAllCodes(enrichedCodes)
            return
          }
        }
      }
      setAllCodes(codesData || [])
    } catch (error) {
      console.error('Failed to load codes (catch block):', error)
      toast({
        title: "Error",
        description: "Failed to load codes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCodes(false)
    }
  }

  // Function to filter and search codes
  const filterAndSearchCodes = () => {
    let filtered = [...allCodes]

    // Apply status filter
    if (codeFilter === 'unused') {
      filtered = filtered.filter(code => code.status === 'unused')
    } else if (codeFilter === 'redeemed') {
      filtered = filtered.filter(code => code.status === 'redeemed')
    }

    // Apply search filter
    if (codeSearchQuery.trim()) {
      const searchLower = codeSearchQuery.toLowerCase()
      filtered = filtered.filter(code => 
        code.code.toLowerCase().includes(searchLower) ||
        code.rewards?.title.toLowerCase().includes(searchLower)
      )
    }

    setFilteredCodes(filtered)
  }

  // Load codes when business is available or when switching to codes tab
  useEffect(() => {
    if (business?.id && activeTab === 'codes') {
      loadAllCodes()
    }
  }, [business?.id, activeTab])

  // Filter codes when filter criteria change
  useEffect(() => {
    filterAndSearchCodes()
  }, [allCodes, codeFilter, codeSearchQuery])

  // Load enhanced statistics when business and rewards are available
  useEffect(() => {
    if (business?.id && rewards.length > 0) {
      console.log('Loading statistics with:', { businessId: business.id, businessPointsConversion: business.points_conversion, rewardsCount: rewards.length })
      Promise.all([
        calculateRewardsBudget().then(setRewardsBudget),
        calculateAmountSpentThisMonth().then(setAmountSpentThisMonth),
        calculateROIThisMonth().then(setROIThisMonth),
        getMostPopularRewardThisMonth().then(setMostPopularReward),
        loadWeeklyRedemptions().then(setWeeklyRedemptions)
      ])
    }
  }, [business?.id, business?.points_conversion, rewards.length, codeCounts])

  const stats = {
    rewardsBudget: rewardsBudget,
    totalRedemptions: rewards.reduce((total, reward) => total + reward.redemptionCount, 0),
    redeemThisWeek: weeklyRedemptions,
    amountSpentThisMonth: amountSpentThisMonth,
    roiThisMonth: roiThisMonth,
    mostPopularReward: mostPopularReward
  }

  // Print codes functions
  const handlePrintCodes = () => {
    setIsPrintModalOpen(true)
  }

  const generatePrintContent = () => {
    const codesToPrint = includeRedeemedCodes ? filteredCodes : filteredCodes.filter(code => code.status !== 'redeemed')
    
    const availableCodes = filteredCodes.filter(code => code.status !== 'redeemed')
    const redeemedCodes = includeRedeemedCodes ? filteredCodes.filter(code => code.status === 'redeemed') : []
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Function to generate pages for a set of codes
    const generatePages = (codes: any[], title: string) => {
      // Sort codes alphabetically by code for easier searching
      const sortedCodes = [...codes].sort((a, b) => a.code.localeCompare(b.code))
      
      if (sortedCodes.length === 0) return ''
      
      // Realistic capacity: 8 codes per column max (7 if customer names present)
      // Use 7 per column to be safe for customer names
      const codesPerColumn = 7 
      const pages = []
      let currentIndex = 0
      
      while (currentIndex < sortedCodes.length) {
        const pageNumber = pages.length + 1
        const totalPages = Math.ceil(sortedCodes.length / (codesPerColumn * 2))
        
        // Get codes for left column (up to 7 codes)
        const leftColumnCodes = sortedCodes.slice(currentIndex, currentIndex + codesPerColumn)
        currentIndex += leftColumnCodes.length
        
        // Get codes for right column (up to 7 more codes)
        const rightColumnCodes = sortedCodes.slice(currentIndex, currentIndex + codesPerColumn)
        currentIndex += rightColumnCodes.length
        
        const totalCodesOnPage = leftColumnCodes.length + rightColumnCodes.length
        const startingCodeNumber = currentIndex - totalCodesOnPage + 1
        const endingCodeNumber = currentIndex
        
        pages.push(`
          <div class="page">
            <div class="header">
              <h1>ZAWADII LOYALTY SYSTEM</h1>
              <h2>${business?.name || 'Restaurant'} Reward Codes</h2>
              <div class="meta">
                <span class="page-info">${title} • Page ${pageNumber} of ${totalPages} • Showing ${startingCodeNumber}-${endingCodeNumber} of ${sortedCodes.length}</span>
                <span class="print-date">Print Date: ${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div class="section-title">${title}</div>

            <div class="two-column">
              <div class="column">
                ${leftColumnCodes.map(code => `
                  <div class="code-item">
                    <div class="code-header">${code.code}</div>
                    <div class="reward-name">${code.rewards?.title || 'Unknown Reward'}</div>
                    <div class="code-details">
                      <div>Points: ${code.rewards?.points_required || 0} • Cost: ${code.rewards?.cost ? formatNumber(code.rewards.cost) + ' TZS' : '0 TZS'}</div>
                      <div class="${code.status === 'unused' ? 'status-available' : code.status === 'bought' ? 'status-bought' : 'status-redeemed'}">
                        Status: ${code.status === 'unused' ? 'Available' : code.status === 'bought' ? 'Bought' : 'Redeemed'}
                      </div>
                      <div>Created: ${new Date(code.created_at).toLocaleDateString()}${code.redeemed_at ? ' • Redeemed: ' + new Date(code.redeemed_at).toLocaleDateString() : ''}</div>
                      ${code.customers?.full_name ? `<div>Customer: ${code.customers.full_name}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="column">
                ${rightColumnCodes.map(code => `
                  <div class="code-item">
                    <div class="code-header">${code.code}</div>
                    <div class="reward-name">${code.rewards?.title || 'Unknown Reward'}</div>
                    <div class="code-details">
                      <div>Points: ${code.rewards?.points_required || 0} • Cost: ${code.rewards?.cost ? formatNumber(code.rewards.cost) + ' TZS' : '0 TZS'}</div>
                      <div class="${code.status === 'unused' ? 'status-available' : code.status === 'bought' ? 'status-bought' : 'status-redeemed'}">
                        Status: ${code.status === 'unused' ? 'Available' : code.status === 'bought' ? 'Bought' : 'Redeemed'}
                      </div>
                      <div>Created: ${new Date(code.created_at).toLocaleDateString()}${code.redeemed_at ? ' • Redeemed: ' + new Date(code.redeemed_at).toLocaleDateString() : ''}</div>
                      ${code.customers?.full_name ? `<div>Customer: ${code.customers.full_name}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `)
      }
      
      return pages.join('')
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title></title>
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          .page {
            page-break-after: always;
            min-height: 24cm;
          }
          .page:last-child {
            page-break-after: auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 18pt;
            font-weight: bold;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 14pt;
            color: #666;
          }
          .header .meta {
            font-size: 9pt;
            color: #888;
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .page-info {
            text-align: left;
          }
          .print-date {
            text-align: right;
          }
          .two-column {
            display: flex;
            gap: 15px;
            height: calc(100% - 80px);
          }
          .column {
            flex: 1;
          }
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin: 0 0 15px 0;
            padding: 5px 8px;
            background: #f0f0f0;
            border-left: 4px solid #F8843A;
            text-align: center;
          }
          .code-item {
            border: 1px solid #ddd;
            margin-bottom: 6px;
            padding: 6px;
            background: #fff;
            break-inside: avoid;
          }
          .code-header {
            font-family: 'Courier New', monospace;
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .reward-name {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 2px;
          }
          .code-details {
            font-size: 9pt;
            color: #666;
            line-height: 1.2;
          }
          .status-available {
            color: #16a34a;
            font-weight: bold;
          }
          .status-redeemed {
            color: #dc2626;
            font-weight: bold;
          }
          .status-bought {
            color: #2563eb;
            font-weight: bold;
          }
          @media print {
            .two-column {
              display: flex !important;
            }
            body {
              font-size: 9pt;
            }
            .page {
              page-break-after: always;
            }
            .page:last-child {
              page-break-after: auto;
            }
            .header .meta {
              display: flex !important;
              justify-content: space-between !important;
            }
          }
        </style>
      </head>
      <body>
        ${availableCodes.length > 0 ? generatePages(availableCodes, 'AVAILABLE CODES') : ''}
        ${redeemedCodes.length > 0 ? generatePages(redeemedCodes, 'REDEEMED CODES') : ''}

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  const handleAddNewReward = () => {
    setSelectedReward(null)
    setIsModalOpen(true)
  }

  const handleGenerateCodes = (reward: Reward) => {
    setSelectedRewardForCodes({ id: reward.id, name: reward.name })
    setIsCodeModalOpen(true)
  }

  const handleDeleteReward = async (id: string) => {
    try {
      const supabase = createClientComponentClient()
      
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id)
        .eq('business_id', business?.id)

      if (error) {
        throw error
      }

      setRewards(rewards.filter(reward => reward.id !== id))
      toast({
        title: "Success",
        description: "Reward deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete reward:", error)
      toast({
        title: "Error",
        description: "Failed to delete reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveReward = async (rewardData: any) => {
    try {
      // The rewardData comes from the modal's onSave callback and contains the real Supabase reward
      if (selectedReward) {
        // Update existing reward in the list
        setRewards(rewards.map(r => 
          r.id === selectedReward.id ? {
            ...r,
            name: rewardData.title,
            description: rewardData.description,
            pointsCost: rewardData.points_required,
            cost: rewardData.cost,
            status: rewardData.is_active ? 'active' : 'inactive',
            image: rewardData.image_url,
          } : r
        ))
        toast({
          title: "Success",
          description: "Reward updated successfully.",
        })
      } else {
        // Add new reward to the list
        const newReward = {
          id: rewardData.id,
          name: rewardData.title,
          description: rewardData.description,
          pointsCost: rewardData.points_required,
          cost: rewardData.cost,
          status: rewardData.is_active ? 'active' : 'inactive',
          image: rewardData.image_url,
          redemptionCount: 0,
          createdAt: rewardData.created_at,
          expiresAt: null
        }
        
        setRewards([newReward, ...rewards])
        toast({
          title: "Success",
          description: "New reward created successfully.",
        })
      }
      
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to save reward:", error)
      toast({
        title: "Error",
        description: "Failed to save reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "inactive":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Utility function to format large numbers with K notation
  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return Math.round(num / 1000) + "K"
    }
    return num.toLocaleString()
  }

  // Function to generate reward codes
  const generateRewardCodes = async (rewardId: string, quantity: number) => {
    if (!business?.id) {
      toast({
        title: "Error",
        description: "Business data not available",
        variant: "destructive",
      })
      return
    }

    // Get reward name for the code prefix
    const reward = rewards.find(r => r.id === rewardId)
    if (!reward) {
      toast({
        title: "Error",
        description: "Reward not found",
        variant: "destructive",
      })
      return
    }

    console.log('Starting code generation:', { 
      rewardId, 
      rewardName: reward.name, 
      quantity, 
      businessId: business.id 
    })

    setIsGeneratingCodes(true)
    try {
      const supabase = createClientComponentClient()
      
      // Get reward code (first 3 letters of meaningful part of reward name)
      const generateRewardCode = (rewardName: string): string => {
        // Remove common prefixes and clean the name
        let cleanName = rewardName.trim()
        
        // Remove common prefixes (case insensitive)
        const prefixesToRemove = ['free', 'get', 'win', 'buy', 'purchase']
        for (const prefix of prefixesToRemove) {
          const regex = new RegExp(`^${prefix}\\s+`, 'i')
          cleanName = cleanName.replace(regex, '')
        }
        
        // Remove numbers, percentages, and special characters from the beginning
        cleanName = cleanName.replace(/^[0-9%\s\-\+\*\/\(\)\[\]\{\}\.,:;!@#$%^&*]+/, '')
        
        // Split into words and find the first meaningful word
        const words = cleanName.split(/\s+/).filter(word => {
          // Remove empty words and words that are just numbers/symbols
          return word.length > 0 && /[a-zA-Z]/.test(word)
        })
        
        let meaningfulWord = ''
        if (words.length > 0) {
          // Take the first meaningful word
          meaningfulWord = words[0]
        } else {
          // Fallback: use the original reward name if no meaningful word found
          meaningfulWord = rewardName
        }
        
        // Extract first 3 letters (only alphabetic characters)
        const letters = meaningfulWord.replace(/[^A-Za-z]/g, '').toUpperCase()
        const code = letters.slice(0, 3).padEnd(3, 'X') // Pad with 'X' if less than 3 letters
        
        console.log('Code generation:', { 
          original: rewardName, 
          cleaned: cleanName, 
          words: words, 
          meaningfulWord: meaningfulWord, 
          letters: letters, 
          finalCode: code 
        })
        
        return code
      }
      
      const rewardCode = generateRewardCode(reward.name)
      
      // Get today's date in MMDD format
      const today = new Date()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateCode = month + day
      
      console.log('Code generation details:', { 
        rewardCode, 
        dateCode, 
        searchPattern: `${rewardCode}${dateCode}%` 
      })
      
      // Get the current sequence number for today and this reward
      const { data: existingCodes, error: countError } = await supabase
        .from('reward_codes')
        .select('code')
        .eq('business_id', business.id)
        .eq('reward_id', rewardId)
        .like('code', `${rewardCode}${dateCode}%`)
        .order('code', { ascending: false })
        .limit(1)

      if (countError) {
        console.error('Error checking existing codes:', countError)
        throw countError
      }

      console.log('Existing codes query result:', existingCodes)

      let startSequence = 1
      if (existingCodes && existingCodes.length > 0) {
        const lastCode = existingCodes[0].code
        const lastSequence = parseInt(lastCode.slice(-3))
        startSequence = lastSequence + 1
        console.log('Found existing codes, starting from sequence:', startSequence)
      } else {
        console.log('No existing codes found, starting from sequence 1')
      }

      // Generate the codes
      const codesToInsert = []
      for (let i = 0; i < quantity; i++) {
        const sequenceNumber = String(startSequence + i).padStart(3, '0')
        const code = `${rewardCode}${dateCode}${sequenceNumber}`
        
        codesToInsert.push({
          code,
          reward_id: rewardId,
          business_id: business.id,
          status: 'unused'
        })
      }

      console.log('Generated codes to insert:', codesToInsert)

      // Check current user authentication status
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      console.log('Current user for insertion:', currentUser?.id, 'Auth error:', authError)

      // Test database connection first
      console.log('Testing database connection...')
      const { data: testData, error: testError } = await supabase
        .from('reward_codes')
        .select('count(*)')
        .limit(1)
      
      console.log('Database connection test:', { testData, testError })

      // Try inserting just one code first to test
      console.log('Testing single code insertion...')
      const testCode = codesToInsert[0]
      console.log('Test code object:', testCode)
      
      const { data: singleInsertData, error: singleInsertError } = await supabase
        .from('reward_codes')
        .insert([testCode])
        .select()

      console.log('Single insert result:', { singleInsertData, singleInsertError })
      
      if (singleInsertError) {
        console.error('Single insert failed with detailed error:', JSON.stringify(singleInsertError, null, 2))
        
        // Check if it's an RLS policy issue
        if (singleInsertError.code === '42501' || singleInsertError.message?.includes('RLS') || singleInsertError.message?.includes('policy')) {
          throw new Error('Database access denied. Please ensure Row Level Security policies are properly configured for the reward_codes table. Contact your database administrator.')
        }
        
        // Check if it's a foreign key constraint issue
        if (singleInsertError.code === '23503' || singleInsertError.message?.includes('foreign key')) {
          throw new Error('Invalid reward or business ID. Please refresh the page and try again.')
        }
        
        // Check if it's a unique constraint issue
        if (singleInsertError.code === '23505' || singleInsertError.message?.includes('unique')) {
          throw new Error('Code already exists. Please try again in a few seconds.')
        }
        
        throw singleInsertError
      }

      // If single insert succeeded, delete it and insert all codes
      if (singleInsertData && singleInsertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('reward_codes')
          .delete()
          .eq('id', singleInsertData[0].id)
        
        console.log('Test code deletion result:', deleteError)
      }

      // Insert all codes
      console.log('Inserting all codes...')
      const { data: insertData, error: insertError } = await supabase
        .from('reward_codes')
        .insert(codesToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting codes:', JSON.stringify(insertError, null, 2))
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
        throw insertError
      }

      console.log('Successfully inserted codes:', insertData)

      // Refresh code counts
      await loadCodeCounts()
      
      // Refresh codes tab if it's active
      if (activeTab === 'codes') {
        await loadAllCodes()
      }
      
      toast({
        title: "Success",
        description: `Generated ${quantity} reward codes successfully`,
      })

    } catch (error) {
      console.error('Failed to generate codes:', JSON.stringify(error, null, 2))
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      toast({
        title: "Error",
        description: `Failed to generate reward codes: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCodes(false)
    }
  }

  // Function to handle code deletion
  const handleDeleteCode = async (code: any) => {
    // Only allow deletion of unused codes
    if (code.status !== 'unused') {
      toast({
        title: "Cannot Delete Code",
        description: "Only unused codes can be deleted for accounting purposes.",
        variant: "destructive",
      })
      return
    }

    setCodeToDelete(code)
    setIsDeleteDialogOpen(true)
  }

  // Function to confirm code deletion
  const confirmDeleteCode = async () => {
    if (!codeToDelete || !business?.id) return

    try {
      const supabase = createClientComponentClient()
      
      const { error } = await supabase
        .from('reward_codes')
        .delete()
        .eq('id', codeToDelete.id)
        .eq('business_id', business.id)
        .eq('status', 'unused') // Extra safety check

      if (error) {
        throw error
      }

      // Remove from local state
      setAllCodes(prevCodes => prevCodes.filter(c => c.id !== codeToDelete.id))
      
      // Refresh code counts
      await loadCodeCounts()

      toast({
        title: "Success",
        description: `Code ${codeToDelete.code} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Failed to delete code:", error)
      toast({
        title: "Error",
        description: "Failed to delete code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCodeToDelete(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rewards & Promotions</h1>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="codes">Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Rewards Management</h2>
            <Button 
              onClick={handleAddNewReward}
              className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Reward
            </Button>
          </div>

          <div className="grid grid-cols-6 gap-4 mb-8">
            <Card className="p-6 relative">
              <h3 className="text-sm font-medium mb-2">Rewards Budget</h3>
              <p className="text-3xl font-bold">{formatNumber(stats.rewardsBudget)} TZS</p>
              <div className="absolute bottom-2 right-2 group">
                <div className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center cursor-help transition-colors">
                  <Info className="h-3 w-3 text-gray-600" />
                </div>
                <div className="invisible group-hover:visible absolute bottom-7 right-0 bg-gray-900 text-white text-xs rounded p-2 w-48 z-10 shadow-lg">
                  Calculated from current available codes × their cost. Shows total value of unredeemed rewards.
                </div>
              </div>
            </Card>
            
            <Card className="p-6 relative">
              <h3 className="text-sm font-medium mb-2">Amount Spent This Month</h3>
              <p className="text-3xl font-bold">{formatNumber(stats.amountSpentThisMonth)} TZS</p>
              <div className="absolute bottom-2 right-2 group">
                <div className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center cursor-help transition-colors">
                  <Info className="h-3 w-3 text-gray-600" />
                </div>
                <div className="invisible group-hover:visible absolute bottom-7 right-0 bg-gray-900 text-white text-xs rounded p-2 w-48 z-10 shadow-lg">
                  Total monetary value of rewards redeemed this month based on their costs.
                </div>
              </div>
            </Card>

            <Card className="p-6 relative">
              <h3 className="text-sm font-medium mb-2">ROI This Month</h3>
              <p className="text-3xl font-bold">{formatNumber(stats.roiThisMonth)} TZS</p>
              <div className="absolute bottom-2 right-2 group">
                <div className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center cursor-help transition-colors">
                  <Info className="h-3 w-3 text-gray-600" />
                </div>
                <div className="invisible group-hover:visible absolute bottom-7 right-0 bg-gray-900 text-white text-xs rounded p-2 w-48 z-10 shadow-lg">
                  Total amount customers spent to earn the points for rewards redeemed this month.
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Total Redemptions</h3>
              <p className="text-3xl font-bold">{formatNumber(stats.totalRedemptions)}</p>
              <span className="text-green-500 text-sm">All time</span>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">This Week's Redemptions</h3>
              <p className="text-3xl font-bold">{formatNumber(stats.redeemThisWeek)}</p>
              <span className="text-green-500 text-sm">Last 7 days</span>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium mb-2">Most Popular Reward</h3>
              <p className="text-lg font-bold truncate" title={stats.mostPopularReward}>
                {stats.mostPopularReward}
              </p>
              <span className="text-gray-500 text-sm">This month</span>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Gift className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rewards yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start building customer loyalty by creating your first reward. 
                Customers can redeem points for these rewards.
              </p>
              <Button 
                onClick={handleAddNewReward}
                className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Reward
              </Button>
            </div>
          ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border"
              >
                  {reward.image ? (
                  <img
                      src={reward.image}
                    alt={reward.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{reward.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateCodes(reward)}
                        className="h-8 px-2 text-xs bg-[#F8843A] hover:bg-[#E77A35] text-white"
                        title="Generate codes"
                      >
                        Generate Codes
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditReward(reward)}
                        className="h-8 w-8"
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteReward(reward.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Points: </span>
                        <span>{reward.pointsCost}</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Cost: </span>
                      <span>{formatNumber(reward.cost)} TZS</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Available Codes: </span>
                      <span className={`font-medium ${
                        (codeCounts[reward.id] || 0) <= 3 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {codeCounts[reward.id] || 0}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className={getStatusColor(reward.status)}>
                        {reward.status ? 
                          reward.status.charAt(0).toUpperCase() + reward.status.slice(1) : 
                          'Unknown'
                        }
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Redemptions: </span>
                      <span>{reward.redemptionCount}</span>
                    </div>
                    
                      <div>
                        <span className="text-gray-500">Created: </span>
                        <span>{new Date(reward.createdAt).toLocaleDateString()}</span>
                      </div>
                    
                      {reward.expiresAt && (
                      <div>
                          <span className="text-gray-500">Expires: </span>
                          <span>{new Date(reward.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="promotions">
          <PromotionsTab business={business} />
        </TabsContent>

        <TabsContent value="codes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Reward Codes Management</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Total Codes: {allCodes.length}
              </div>
              {filteredCodes.length > 0 && (
                <Button
                  onClick={handlePrintCodes}
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Codes
                </Button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={codeFilter} onValueChange={(value: 'all' | 'unused' | 'redeemed') => setCodeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Codes</SelectItem>
                  <SelectItem value="unused">Unused Only</SelectItem>
                  <SelectItem value="redeemed">Redeemed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by code or reward name..."
                value={codeSearchQuery}
                onChange={(e) => setCodeSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCodes.length} of {allCodes.length} codes
            {codeFilter !== 'all' && ` (${codeFilter})`}
            {codeSearchQuery && ` matching "${codeSearchQuery}"`}
          </div>

          {/* Codes Table */}
          {isLoadingCodes ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <QrCode className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {allCodes.length === 0 ? 'No codes generated yet' : 'No codes found'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {allCodes.length === 0 
                  ? 'Generate reward codes from the Rewards tab to see them here.'
                  : 'Try adjusting your filters or search query to find codes.'
                }
              </p>
              {allCodes.length === 0 && (
                <Button 
                  onClick={() => setActiveTab('rewards')}
                  className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
                >
                  Go to Rewards
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">Code</th>
                      <th className="text-left p-4 font-medium text-gray-900">Reward</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-900">Points</th>
                      <th className="text-left p-4 font-medium text-gray-900">Cost</th>
                      <th className="text-left p-4 font-medium text-gray-900">Created</th>
                      <th className="text-left p-4 font-medium text-gray-900">Redeemed</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {code.code}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {code.rewards?.title || 'Unknown Reward'}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {code.rewards?.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={code.status === 'unused' ? 'default' : 'secondary'}
                            className={
                              code.status === 'unused' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : code.status === 'bought'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {code.status === 'unused' ? 'Available' : 
                             code.status === 'bought' ? 'Bought' : 'Redeemed'}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-900">
                          {code.customers?.full_name || (code.customer_id ? 'Unknown Customer' : '-')}
                        </td>
                        <td className="p-4 text-gray-900">
                          {code.rewards?.points_required || 0}
                        </td>
                        <td className="p-4 text-gray-900">
                          {code.rewards?.cost ? `${formatNumber(code.rewards.cost)} TZS` : '0 TZS'}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {new Date(code.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {code.redeemed_at 
                            ? new Date(code.redeemed_at).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="p-4">
                          {code.status === 'unused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCode(code)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete unused code"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {code.status !== 'unused' && (
                            <span className="text-gray-400 text-xs">Cannot delete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddEditRewardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        business={business}
        settings={settings}
        reward={selectedReward ? {
          id: selectedReward.id,
          created_at: selectedReward.createdAt,
          business_id: business?.id || '',
          title: selectedReward.name,
          description: selectedReward.description,
          points_required: selectedReward.pointsCost,
          cost: selectedReward.cost,
          is_active: selectedReward.status === 'active',
          image_url: selectedReward.image,
          terms_and_conditions: null,
          uses_default_terms: true
        } : null}
        onSave={handleSaveReward}
        onError={(error) => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
        }}
      />

      <CodeGenerationModal
        open={isCodeModalOpen}
        onOpenChange={setIsCodeModalOpen}
        reward={selectedRewardForCodes}
        onGenerate={generateRewardCodes}
        isGenerating={isGeneratingCodes}
        businessName={business?.name || ""}
      />

      {/* Delete Code Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the code <strong>{codeToDelete?.code}</strong>?
              <br />
              <br />
              This action cannot be undone. Only unused codes can be deleted for accounting purposes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCode}
            >
              Delete Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Options Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Reward Codes</DialogTitle>
            <DialogDescription>
              Choose your print options. Available codes will print first, followed by redeemed codes on separate pages (if enabled). All codes are formatted in a two-column layout optimized for A4 paper.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Available Codes:</span>
                <span className="ml-2 text-green-600">
                  {filteredCodes.filter(code => code.status !== 'redeemed').length}
                </span>
              </div>
              <div>
                <span className="font-medium">Redeemed Codes:</span>
                <span className="ml-2 text-red-600">
                  {filteredCodes.filter(code => code.status === 'redeemed').length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeRedeemed"
                checked={includeRedeemedCodes}
                onChange={(e) => setIncludeRedeemedCodes(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="includeRedeemed" className="text-sm font-medium">
                Include redeemed codes on separate pages
              </label>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Print Preview:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Two-column layout for efficient space usage</li>
                <li>• Restaurant header with date and page numbers</li>
                <li>• Available codes print first (left column fills first, then right)</li>
                <li>• Redeemed codes print on separate pages afterward (if enabled)</li>
                <li>• Codes sorted alphabetically for easy searching</li>
                <li>• Each code shows: Code, Reward, Points, Cost, Status, Dates</li>
                <li>• Approximately 14 codes per A4 page (7 per column)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                generatePrintContent()
                setIsPrintModalOpen(false)
              }}
              className="bg-[#F8843A] hover:bg-[#E77A35] text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 