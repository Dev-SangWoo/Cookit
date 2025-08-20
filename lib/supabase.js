import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujqdizvpkrjunyrcpvtf.supabase.co';
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWRpenZwa3JqdW55cmNwdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODU3OTksImV4cCI6MjA2OTI2MTc5OX0.4CZLUJZIDJbtYtzPoiWQxZoEYnQ71JZdXv_09UrACDA';

export const supabase = createClient(supabaseUrl, supabaseKey);