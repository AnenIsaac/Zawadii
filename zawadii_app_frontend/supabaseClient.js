// supabaseClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjoniqctdhcodrgmnzoe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb25pcWN0ZGhjb2RyZ21uem9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTcxOTIsImV4cCI6MjA2NDA5MzE5Mn0.uIy8ChQdn2J_xFEwxCu-AnYEwvBu4GToLH5zTPEWo_U'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  // Tell Supabase to use AsyncStorage under the hood
  auth: {
    storage: AsyncStorage,
    // Optionally, set how often to refresh the session
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
