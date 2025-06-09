// middleware.ts (in root directory)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache key for business check - using a more secure approach
const BUSINESS_CHECK_CACHE_KEY = 'sb-biz-check'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Skip middleware for non-page requests
  const isPageRequest = req.nextUrl.pathname.match(/\.[^/]+$/) === null
  if (!isPageRequest) {
    return res
  }

  console.log('Middleware - Processing:', req.nextUrl.pathname)

  // Define auth routes
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback']
  const publicRoutes = ['/']
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Validate user session using getUser() for proper JWT verification
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Handle authentication errors or missing user
  if (authError || !user) {
    console.log('Auth validation failed:', authError?.message || 'No user found')
    
    // Clear potentially corrupted session cookies
    res.cookies.delete('sb-access-token')
    res.cookies.delete('sb-refresh-token')
    res.cookies.delete(BUSINESS_CHECK_CACHE_KEY)
    
    // Allow access to auth routes and public routes only
    if (!isAuthRoute && !isPublicRoute) {
      console.log('Redirecting unauthenticated user to login')
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  }

  // User is authenticated beyond this point
  console.log('Middleware - Authenticated user access:', {
    userId: user.id,
    pathname: req.nextUrl.pathname
  })

  // If trying to access auth routes while authenticated, redirect to reports
  if (isAuthRoute) {
    console.log('Redirecting authenticated user away from auth routes')
    return NextResponse.redirect(new URL('/reports', req.url))
  }

  // Skip business check for business setup route to prevent redirect loops
  if (req.nextUrl.pathname.startsWith('/auth/business-setup')) {
    console.log('Allowing access to business setup route')
    return res
  }

  // Check cached business status (with shorter cache time for security)
  const businessCheckCookie = req.cookies.get(BUSINESS_CHECK_CACHE_KEY)
  let cachedBusinessCheck = null
  
  try {
    cachedBusinessCheck = businessCheckCookie?.value 
      ? JSON.parse(businessCheckCookie.value) 
      : null
  } catch (error) {
    console.error('Error parsing business check cache:', error)
    // Clear corrupted cache
    res.cookies.delete(BUSINESS_CHECK_CACHE_KEY)
  }

  // Use cached result if valid and recent (2 minutes for better security)
  const TWO_MINUTES = 2 * 60 * 1000
  const isCacheValid = cachedBusinessCheck?.timestamp 
    && (Date.now() - cachedBusinessCheck.timestamp < TWO_MINUTES)
    && cachedBusinessCheck.userId === user.id

  if (isCacheValid && cachedBusinessCheck.hasBusiness) {
    console.log('Using cached business check - business exists')
    
    // Check if business is active
    if (cachedBusinessCheck.status !== 'active') {
      console.log('Business status not active:', cachedBusinessCheck.status)
      // You might want to redirect to a status page or show a message
      // For now, we'll allow access but you can customize this behavior
    }
    
    return res
  }

  if (isCacheValid && !cachedBusinessCheck.hasBusiness) {
    console.log('Using cached business check - no business, redirecting to setup')
    return NextResponse.redirect(new URL('/auth/business-setup', req.url))
  }

  // Perform fresh business check
  console.log('Performing fresh business check for user:', user.id)
  
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, status, name, user_id')
    .eq('user_id', user.id)
    .single()

  // Handle database errors (except "no rows found" which is expected for new users)
  if (businessError && businessError.code !== 'PGRST116') {
    console.error('Error fetching business data:', businessError)
    // Allow access on database errors to prevent blocking users
    // You might want to handle this differently based on your requirements
    return res
  }

  console.log('Fresh business check result:', { 
    userId: user.id, 
    hasBusiness: !!business,
    status: business?.status
  })

  // Cache the business check result with shorter expiry
  const businessCheckResult = {
    userId: user.id,
    hasBusiness: !!business,
    status: business?.status || null,
    timestamp: Date.now()
  }
  
  res.cookies.set({
    name: BUSINESS_CHECK_CACHE_KEY,
    value: JSON.stringify(businessCheckResult),
    path: '/',
    maxAge: 120, // 2 minutes instead of 5 for better security
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' // Only use secure in production
  })

  // Redirect to business setup if no business exists
  if (!business) {
    console.log('No business found, redirecting to business setup')
    return NextResponse.redirect(new URL('/auth/business-setup', req.url))
  }

  // Handle inactive business status
  if (business.status !== 'active') {
    console.log('Business status is not active:', business.status)
    // Uncomment and customize based on your business logic:
    // if (business.status === 'suspended') {
    //   return NextResponse.redirect(new URL('/auth/account-suspended', req.url))
    // }
    // if (business.status === 'pending') {
    //   return NextResponse.redirect(new URL('/auth/account-pending', req.url))
    // }
  }

  return res
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public/
    // - api/
    // - _next/
    '/((?!_next/static|_next/image|favicon.ico|public/|api/|_next/).*)',
  ],
}