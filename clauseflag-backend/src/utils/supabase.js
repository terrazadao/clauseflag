// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Environment variables check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('All SUPABASE env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
