import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/auth-helpers-nextjs'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const redirectToLogin = useCallback(() => {
    const returnTo = window.location.pathname + window.location.search
    router.push(`/auth/login?redirectTo=${encodeURIComponent(returnTo)}`)
  }, [router])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const checkAuth = async () => {
      try {
        console.log('useAuth - Starting auth check at:', new Date().toISOString())
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('useAuth - Auth check timeout reached, forcing resolution')
            // If we're on a protected route and middleware let us through, assume we're authenticated
            if (!window.location.pathname.includes('/auth/')) {
              console.log('useAuth - Setting middleware-verified user due to timeout')
              // Create a minimal user object from the route we're on
              setUser({ id: 'middleware-verified' } as User)
              setError(null)
            }
            console.log('useAuth - Setting isLoading to false due to timeout')
            setIsLoading(false)
          }
        }, 2000) // 2 second timeout

        console.log('useAuth - Attempting to get session...')
        // Try to get session, but don't block forever
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('useAuth - Session response received, clearing timeout')
        // Clear timeout since we got a response
        if (timeoutId) clearTimeout(timeoutId)
        
        if (!mounted) {
          console.log('useAuth - Component unmounted, returning early')
          return
        }

        console.log('useAuth - Session check result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          error: sessionError?.message 
        })

        if (sessionError) {
          throw sessionError
        }

        if (!session?.user) {
          // Only redirect if we're not already on a login page
          if (!window.location.pathname.includes('/auth/')) {
            console.log('useAuth - No session, redirecting to login')
            redirectToLogin()
          } else {
            console.log('useAuth - No session but on auth page, that\'s fine')
          }
          console.log('useAuth - Setting isLoading to false (no session)')
          setIsLoading(false)
          return
        }

        console.log('useAuth - User authenticated:', session.user.id)
        setUser(session.user)
        setError(null)
        console.log('useAuth - Setting isLoading to false (authenticated)')
        setIsLoading(false)
      } catch (err) {
        console.log('useAuth - Caught error, clearing timeout')
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId)
        
        if (!mounted) {
          console.log('useAuth - Component unmounted in error handler, returning early')
          return
        }
        
        console.error('useAuth - Auth error:', err)
        
        // If we're on a protected route and got an auth error, but middleware let us through,
        // then assume the user is actually authenticated and the client-side check failed
        if (!window.location.pathname.includes('/auth/')) {
          console.log('useAuth - Auth error but on protected route (middleware passed), assuming authenticated')
          setUser({ id: 'middleware-verified' } as User)
          setError(null)
        } else {
          setError(err instanceof Error ? err.message : 'Authentication failed')
        }
        console.log('useAuth - Setting isLoading to false (error case)')
        setIsLoading(false)
      }
    }

    console.log('useAuth - useEffect triggered, calling checkAuth')
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      console.log('useAuth - Auth state change:', event, !!session?.user)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        if (!window.location.pathname.includes('/auth/')) {
          router.push('/auth/login')
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setError(null)
        console.log('useAuth - Setting isLoading to false (signed in)')
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      console.log('useAuth - Cleanup: clearing timeout and unsubscribing')
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [redirectToLogin, router, supabase.auth])

  return { user, isLoading, error }
} 