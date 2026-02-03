// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const getSupabase = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables. Please add SUPABASE_URL and SUPABASE_SERVICE_KEY in Render dashboard → Environment tab.');
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
};

module.exports = getSupabase;
