// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drcyglpedspivexmviel.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyY3lnbHBlZHNwaXZleG12aWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDk2MjEsImV4cCI6MjA2ODMyNTYyMX0.sGF4PtErRPwn62fE6Lwv-Ao4-9QPhV-Fq07Y1xWBJeI'

export const supabase = createClient(supabaseUrl, supabaseKey)
