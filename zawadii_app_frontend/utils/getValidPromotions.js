// utils/getValidPromotions.js
// Utility to fetch latest 4 valid promotions from Supabase
import { supabase } from '../supabaseClient';

export async function getValidPromotions(limit = 5) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('created_at', { ascending: false }) // Order by most recently created
    .limit(limit);
  if (error) throw error;
  return data;
}
