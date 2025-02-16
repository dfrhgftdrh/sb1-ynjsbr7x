import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khmudcqekradpnoxhain.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobXVkY3Fla3JhZHBub3hoYWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MzY2OTgsImV4cCI6MjA1MzExMjY5OH0.GZpmw-oFElsyLL4DvPDSGtDDEl2eRFFeDGSzUCAeKeg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateToAdmin() {
  try {
    // First get the user's ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'mahatosubashis3@gmail.com')
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error('User not found');

    // Update the role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userData.id);

    if (updateError) throw updateError;
    console.log('Successfully updated user role to admin');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateToAdmin();