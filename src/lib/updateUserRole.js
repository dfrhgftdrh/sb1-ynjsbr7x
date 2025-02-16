import { supabase } from './supabase';

export async function updateUserToAdmin(email) {
  try {
    // First get the user's ID from auth.users using their email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) throw userError;
    if (!userData?.user) throw new Error('User not found');

    // Update the user's role in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userData.user.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}