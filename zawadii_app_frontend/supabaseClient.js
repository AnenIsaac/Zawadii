// supabaseClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpctfbksqhuvjcxshzfk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY3RmYmtzcWh1dmpjeHNoemZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODc5MDUsImV4cCI6MjA2MzA2MzkwNX0.o7yyOPO_SKPCIMlTT2bPKkcJCbgW_YX8Hcl5sA-50Sc'

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
