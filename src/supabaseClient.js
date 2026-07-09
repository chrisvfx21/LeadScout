import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkmnewtwepfejwpqfiho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbW5ld3R3ZXBmZWp3cHFmaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NjY2NzIsImV4cCI6MjA5OTA0MjY3Mn0.W2VGjP0h_35R4FmrBACGAE3gZjSCqkj9Gv2nT9a4h6M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)