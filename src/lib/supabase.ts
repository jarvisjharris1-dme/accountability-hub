import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://eklsncluqwpppttegxdv.supabase.co';
const supabaseKey = 'sb_publishable_eOv-4rHdN6qZT0DrDwnrNQ_mlZNiBjz';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };