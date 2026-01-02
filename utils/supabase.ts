import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelas suas chaves do Supabase
const SUPABASE_URL = 'https://rnnybvjyeeyhckxilogt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubnlidmp5ZWV5aGNreGlsb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDkyODIsImV4cCI6MjA4Mjg4NTI4Mn0.696hzQHa4WDjBbRDe56M7kJhtFkB7ctZ-9OcOxqi6Hw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});