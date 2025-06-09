import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Business } from "@/types/common"

interface UseBusinessReturn {
  business: Business | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBusiness(user_id: string): UseBusinessReturn {
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchBusiness = useCallback(async () => {
    console.log('useBusiness - fetchBusiness called with user_id:', user_id)
    
    if (!user_id) {
      console.log('useBusiness - No user_id provided, stopping loading')
      setIsLoading(false)
      return
    }

    // Special case: if user_id is 'middleware-verified', assume business exists
    if (user_id === 'middleware-verified') {
      console.log('useBusiness - Middleware verified user, assuming business exists')
      setBusiness({ id: 'middleware-verified' } as Business)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('useBusiness - Fetching business data for user:', user_id)

      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Business fetch timeout')), 5000)
      })

      const fetchPromise = supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user_id)
        .single()

      const { data, error: businessError } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (businessError) {
        if (businessError.code === 'PGRST116') {
          // No business found
          console.log('useBusiness - No business found for user:', user_id)
          setBusiness(null)
        } else {
          console.error('useBusiness - Business fetch error:', businessError)
          throw businessError
        }
      } else {
        console.log('useBusiness - Business found:', data?.id)
        setBusiness(data as Business)
      }
    } catch (err) {
      console.error('useBusiness - Error fetching business:', err)
      
      // If we timeout but we're on a protected route, assume business exists (middleware verified it)
      if (err instanceof Error && err.message === 'Business fetch timeout' && 
          !window.location.pathname.includes('/auth/') && 
          !window.location.pathname.includes('/business-setup')) {
        console.log('useBusiness - Timeout but on protected route, assuming business exists')
        setBusiness({ id: 'middleware-verified' } as Business)
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch business data')
      }
    } finally {
      console.log('useBusiness - Finished fetching, setting isLoading to false')
      setIsLoading(false)
    }
  }, [user_id, supabase])

  useEffect(() => {
    fetchBusiness()
  }, [fetchBusiness])

  return { 
    business, 
    isLoading, 
    error, 
    refetch: fetchBusiness 
  }
} 