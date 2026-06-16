import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oqtnzapzhulcjqedzaas.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG56YXB6aHVsY2pxZWR6YWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODU2MjYsImV4cCI6MjA5Njk2MTYyNn0.2s3U47gn8FsfKzcY5iMJcD91qM70okmf1F_V8K738lY'

export const supabase = createClient(supabaseUrl, supabaseKey)