import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Enhanced login function with better error handling
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Validate inputs
    if (!email.trim()) throw new Error('Email is required');
    if (!password.trim()) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    // Use email as is since it's a full email address
    const emailToUse = email.trim();

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password.trim()
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address');
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Enhanced signup function
export const signUpWithEmail = async (email: string, password: string, username: string) => {
  try {
    // Validate inputs
    if (!email.trim()) throw new Error('Email is required');
    if (!password.trim()) throw new Error('Password is required');
    if (!username.trim()) throw new Error('Username is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (username.length < 3) throw new Error('Username must be at least 3 characters');

    // Use email as is for full email addresses
    const emailToUse = email.trim();

    // Check if username is available
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim())
      .single();

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email: emailToUse,
      password: password.trim(),
      options: {
        data: {
          username: username.trim()
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          username: username.trim(),
          role: 'user'
        }]);

      if (profileError) throw profileError;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    if (!email.trim()) throw new Error('Email is required');

    const emailToUse = email.trim();

    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};

export const resetPassword = async (password: string) => {
  try {
    if (!password.trim()) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const { error } = await supabase.auth.updateUser({ password: password.trim() });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Check auth status
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Auth check error:', error);
    return { session: null, error };
  }
};