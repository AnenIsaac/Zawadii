import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SignUpData, SignInData, AuthError } from '@/types/auth'

export async function signUp({ email, password, phone }: SignUpData) {
  const supabase = createClientComponentClient()
  
  try {
    console.log('Starting signup process for:', email)
    
    // Create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: {
          business_setup_completed: false
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      
      // Provide more specific error messages
      let userMessage = authError.message
      if (authError.message.includes('User already registered')) {
        userMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (authError.message.includes('Password should be at least')) {
        userMessage = 'Password must be at least 6 characters long.'
      } else if (authError.message.includes('Invalid email')) {
        userMessage = 'Please enter a valid email address.'
      }
      
      throw new Error(userMessage)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    console.log('User created successfully:', authData.user.id)
    console.log('Email confirmation sent to:', email)

    // Don't sign out the user - let them proceed to OTP verification
    // The user will remain in an unconfirmed state until they verify

    return { 
      data: { 
        user: {
          ...authData.user,
          hasBusiness: false
        }
      }, 
      error: null 
    }
  } catch (error: any) {
    console.error('Signup process failed:', error)
    return { data: null, error: { message: error.message } as AuthError }
  }
}

export async function signIn({ email, password }: SignInData) {
  const supabase = createClientComponentClient()
  
  try {
    console.log('Starting sign in process for:', email)
    
    // Attempt to sign in
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      
      // Map Supabase error messages to user-friendly messages
      let userMessage = 'Invalid email or password'
      
      if (signInError.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password'
      } else if (signInError.message.includes('Email not confirmed')) {
        userMessage = 'Please verify your email address before signing in. Check your inbox for a verification link.'
      } else if (signInError.message.includes('Invalid email')) {
        userMessage = 'Please enter a valid email address'
      } else if (signInError.message.includes('rate limit')) {
        userMessage = 'Too many login attempts. Please try again later'
      } else if (signInError.message.includes('signups not allowed')) {
        userMessage = 'Account registration is temporarily disabled'
      }

      return { data: null, error: { message: userMessage } as AuthError, hasBusiness: false }
    }

    if (!authData?.user) {
      console.error('No user data received after sign in')
      return { data: null, error: { message: 'Sign in failed. Please try again.' } as AuthError, hasBusiness: false }
    }

    console.log('Sign in successful for user:', authData.user.id)

    // Check if user has a business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', authData.user?.id)
      .single()

    if (businessError && businessError.code !== 'PGRST116') { // PGRST116 is the 'not found' error code
      console.error('Business check error:', businessError)
      throw businessError
    }

    const hasBusiness = businessData !== null
    console.log('Business check result:', { hasBusiness, businessId: businessData?.id })

    return { 
      data: authData, 
      error: null, 
      hasBusiness 
    }

  } catch (error: any) {
    console.error('Sign in process failed:', error)
    return { 
      data: null, 
      error: { message: error.message } as AuthError,
      hasBusiness: false
    }
  }
}

export async function signOut() {
  const supabase = createClientComponentClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: { message: error.message } as AuthError }
  }
}

export async function resetPassword(email: string) {
  const supabase = createClientComponentClient()
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: { message: error.message } as AuthError }
  }
}

// Add OTP verification function
export async function verifyOtp(email: string, token: string) {
  const supabase = createClientComponentClient()
  
  try {
    console.log('Verifying OTP for:', email)
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    })

    if (error) {
      console.error('OTP verification error:', error)
      throw new Error(error.message)
    }

    console.log('OTP verification successful')
    return { data, error: null }
  } catch (error: any) {
    console.error('OTP verification failed:', error)
    return { data: null, error: { message: error.message } as AuthError }
  }
}

// Add resend OTP function
export async function resendOtp(email: string) {
  const supabase = createClientComponentClient()
  
  try {
    console.log('Resending OTP for:', email)
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    if (error) {
      console.error('Resend OTP error:', error)
      throw new Error(error.message)
    }

    console.log('OTP resent successfully')
    return { error: null }
  } catch (error: any) {
    console.error('Resend OTP failed:', error)
    return { error: { message: error.message } as AuthError }
  }
}
