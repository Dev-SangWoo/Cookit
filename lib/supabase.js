import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const supabaseUrl = 'https://ujqdizvpkrjunyrcpvtf.supabase.co';
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWRpenZwa3JqdW55cmNwdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODU3OTksImV4cCI6MjA2OTI2MTc5OX0.4CZLUJZIDJbtYtzPoiWQxZoEYnQ71JZdXv_09UrACDA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage, // ✅ AsyncStorage를 스토리지로 지정
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});